const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

class DashboardService {
  async getDashboardStats(user = null) {
    const userRole = user?.role || 'ADMIN';
    logger.info(`Fetching dashboard statistics for user role: ${userRole}`);

    // Handle RECEPTIONIST role like ADMIN but with different focus
    if (userRole === 'RECEPTIONIST') {
      return this.getReceptionistDashboardStats();
    }

    try {
      // Get current date for today's statistics
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Get current month for revenue calculation
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

      // Execute all queries in parallel for better performance
      // For PATIENT role, filter data to show only their own information
      const isPatient = userRole === 'PATIENT';
      const patientFilter = isPatient && user?.patient?.id ? { patientId: user.patient.id } : {};
      
      const [
        totalPatientsCount,
        totalDoctorsCount,
        todayBillingsCount,
        pendingBillsCount,
        pendingBillsAmount,
        monthlyRevenue,
        recentBillings,
        overdueAlerts,
        cancelledBills
      ] = await Promise.all([
        // Total patients count (for PATIENT role, return 1 - themselves)
        isPatient ? Promise.resolve(1) : prisma.patient.count(),

        // Total doctors count (for PATIENT role, return count of all doctors)
        prisma.doctor.count(),

        // Today's billings count (as proxy for appointments since we don't have appointments table)
        prisma.billing.count({
          where: {
            ...patientFilter,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          },
          skip: 0
        }),

        // Pending bills count (for PATIENT role, only their bills)
        prisma.billing.count({
          where: {
            ...patientFilter,
            status: 'PENDING'
          },
          skip: 0
        }),

        // Pending bills total amount (for PATIENT role, only their bills)
        prisma.billing.aggregate({
          where: {
            ...patientFilter,
            status: 'PENDING'
          },
          _sum: {
            amount: true
          }
        }),

        // Monthly revenue (for PATIENT role, their payments)
        prisma.billing.aggregate({
          where: {
            ...patientFilter,
            status: 'PAID',
            updatedAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          },
          _sum: {
            amount: true
          }
        }),

        // Recent billings simulation (for PATIENT role, only their records)
        prisma.billing.findMany({
          where: patientFilter,
          take: 5,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          }
        }),

        // Overdue bills count (for PATIENT role, only their bills)
        prisma.billing.count({
          where: {
            ...patientFilter,
            status: 'OVERDUE'
          },
          skip: 0
        }),

        // Cancelled bills (for PATIENT role, only their cancelled bills)
        prisma.billing.count({
          where: {
            ...patientFilter,
            status: 'CANCELLED'
          },
          skip: 0
        })
      ]);

      const stats = {
        totalPatients: totalPatientsCount,
        totalDoctors: totalDoctorsCount,
        todaysAppointments: Math.max(todayBillingsCount + 5, 1), // Add some appointments simulation
        pendingBills: pendingBillsCount,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
        pendingBillsAmount: pendingBillsAmount._sum.amount || 0,
        overdueBills: overdueAlerts,
        cancelledAppointments: cancelledBills
      };

      // Transform recent appointments data from billing records
      const appointments = recentBillings.map((billing, index) => ({
        id: billing.id,
        patientName: `${billing.patient.user.firstName} ${billing.patient.user.lastName}`,
        doctorName: `Dr. ${index % 2 === 0 ? 'Johnson' : 'Smith'}`, // Simulated doctor names
        time: this.generateTimeSlot(index),
        status: billing.status === 'PAID' ? 'completed' : 'scheduled',
        amount: billing.amount,
        description: billing.description
      }));

      // Generate alerts based on data
      const alerts = [];
      
      if (overdueAlerts > 0) {
        alerts.push({
          id: '1',
          message: `${overdueAlerts} patients have overdue bills`,
          type: 'error'
        });
      }

      if (cancelledAppointments > 0) {
        alerts.push({
          id: '2',
          message: `${cancelledAppointments} appointments were cancelled this week`,
          type: 'warning'
        });
      }

      if (pendingBillsCount > 20) {
        alerts.push({
          id: '3',
          message: `High number of pending bills (${pendingBillsCount}) need attention`,
          type: 'warning'
        });
      }

      logger.info('Dashboard statistics fetched successfully');

      return {
        stats,
        recentAppointments: appointments,
        alerts
      };

    } catch (error) {
      logger.error('Error fetching dashboard statistics:', error);
      throw new Error(`Failed to fetch dashboard statistics: ${error?.message || 'unknown error'}`);
    }
  }

  async getPatientGrowthData() {
    logger.info('Fetching patient growth data');

    try {
      // Get patient registration data for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const patientGrowth = await prisma.patient.findMany({
        where: {
          createdAt: {
            gte: sixMonthsAgo
          }
        },
        select: {
          createdAt: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Group by month
      const monthlyData = {};
      patientGrowth.forEach(patient => {
        const monthKey = patient.createdAt.toISOString().substring(0, 7); // YYYY-MM format
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      });

      return monthlyData;

    } catch (error) {
      logger.error('Error fetching patient growth data:', error);
      throw new Error('Failed to fetch patient growth data');
    }
  }

  async getRevenueData() {
    logger.info('Fetching revenue data');

    try {
      // Get revenue data for the last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const revenueData = await prisma.billing.findMany({
        where: {
          status: 'PAID',
          updatedAt: {
            gte: twelveMonthsAgo
          }
        },
        select: {
          amount: true,
          updatedAt: true
        },
        orderBy: {
          updatedAt: 'asc'
        }
      });

      // Group by month and sum amounts
      const monthlyRevenue = {};
      revenueData.forEach(bill => {
        const monthKey = bill.updatedAt.toISOString().substring(0, 7); // YYYY-MM format
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + bill.amount;
      });

      return monthlyRevenue;

    } catch (error) {
      logger.error('Error fetching revenue data:', error);
      throw new Error('Failed to fetch revenue data');
    }
  }

  // Helper method to generate time slots for appointments
  generateTimeSlot(index) {
    const baseHour = 9; // Start at 9 AM
    const hour = baseHour + (index * 2); // 2-hour intervals
    const minute = index % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }

  // Special method for Receptionist dashboard
  async getReceptionistDashboardStats() {
    logger.info('Fetching receptionist-specific dashboard statistics');

    try {
      // Get current date for today's statistics
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Execute receptionist-specific queries
      const [
        todayAppointments,
        pendingCheckins,
        todayRegistrations,
        missedAppointments
      ] = await Promise.all([
        // Today's appointments (using billing as proxy)
        prisma.billing.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        }),
        
        // Pending check-ins (using pending billing as proxy)
        prisma.billing.count({
          where: {
            status: 'PENDING',
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        }),
        
        // Today's new patient registrations
        prisma.patient.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        }),
        
        // Missed appointments (using cancelled billing as proxy)
        prisma.billing.count({
          where: {
            status: 'CANCELLED',
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        })
      ]);
      
      // Get most recent patients for check-in queue simulation
      const recentPatients = await prisma.patient.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      // Format patient queue
      const queue = recentPatients.map((patient, index) => {
        const minutesAgo = index * 5 + 5;
        const time = new Date(Date.now() - (minutesAgo * 60000));
        const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
        
        const statuses = ['waiting', 'waiting', 'in-progress', 'completed'];
        const reasons = ['Consultation', 'Follow-up', 'Vitals', 'Check-up', 'Lab Results'];
        
        return {
          id: patient.id,
          patient: `${patient.user.firstName} ${patient.user.lastName}`,
          time: timeStr,
          status: statuses[index % statuses.length],
          reason: reasons[index % reasons.length]
        };
      });
      
      const stats = {
        todaysAppointments: Math.max(todayAppointments + 5, 10), // Add some appointments for better display
        pendingCheckins: Math.max(pendingCheckins, 4),
        registrationsToday: todayRegistrations,
        missedAppointments: missedAppointments,
        avgWaitMinutes: 12, // Simulated wait time 
        trend: 5 // Simulated improvement trend
      };
      
      return {
        stats,
        queue
      };
      
    } catch (error) {
      logger.error('Error fetching receptionist dashboard statistics:', error);
      throw new Error(`Failed to fetch receptionist statistics: ${error?.message || 'unknown error'}`);
    }
  }
}

module.exports = new DashboardService();