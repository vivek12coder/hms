'use client';

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';

interface Appointment {
  id: string;
  title: string;
  start: string;
  end: string;
  patientName: string;
  doctorName: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

interface CalendarProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onDateSelect?: (date: string) => void;
}

export function Calendar({ appointments, onAppointmentClick, onDateSelect }: CalendarProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const calendarEvents = appointments.map((appointment) => ({
    id: appointment.id,
    title: `${appointment.patientName} - ${appointment.doctorName}`,
    start: appointment.start,
    end: appointment.end,
    backgroundColor: getStatusColor(appointment.status),
    borderColor: getStatusColor(appointment.status),
    extendedProps: {
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      status: appointment.status,
      notes: appointment.notes,
    },
  }));

  function getStatusColor(status: string) {
    switch (status) {
      case 'scheduled':
        return '#3b82f6'; // blue
      case 'completed':
        return '#10b981'; // green
      case 'cancelled':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  }

  function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  const handleEventClick = (info: any) => {
    const appointment = appointments.find(app => app.id === info.event.id);
    if (appointment) {
      setSelectedAppointment(appointment);
      setIsDialogOpen(true);
      onAppointmentClick?.(appointment);
    }
  };

  const handleDateClick = (info: any) => {
    onDateSelect?.(info.dateStr);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Appointment Calendar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            initialView="dayGridMonth"
            events={calendarEvents}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height="600px"
            eventDisplay="block"
            displayEventTime={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }}
            slotMinTime="08:00:00"
            slotMaxTime="18:00:00"
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday to Saturday
              startTime: '09:00',
              endTime: '17:00',
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Status</h3>
                <Badge variant={getStatusVariant(selectedAppointment.status)}>
                  {selectedAppointment.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Patient:</span>
                  <span>{selectedAppointment.patientName}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Doctor:</span>
                  <span>{selectedAppointment.doctorName}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Time:</span>
                  <span>
                    {new Date(selectedAppointment.start).toLocaleDateString()} at{' '}
                    {new Date(selectedAppointment.start).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div>
                  <span className="font-medium">Notes:</span>
                  <p className="mt-1 text-sm text-gray-600">{selectedAppointment.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button>
                  Edit Appointment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}