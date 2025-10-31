const { asyncHandler } = require('../middleware/error');
const { billingService } = require('../services/BillingService');
const { z } = require('zod');

// Enhanced validation schemas with security improvements
const createBillingSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required').max(100),
  amount: z.number()
    .min(0, 'Amount cannot be negative')
    .max(1000000, 'Amount exceeds maximum allowed')
    .refine((val) => Number.isFinite(val), 'Invalid amount'),
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description too long')
    .trim(),
  dueDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .refine((date) => {
      const dueDate = new Date(date);
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 1); // Max 1 year in past
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 5); // Max 5 years in future
      return dueDate >= minDate && dueDate <= maxDate;
    }, 'Invalid due date range')
    .transform((str) => new Date(str))
    .optional(),
});

const updateBillingSchema = z.object({
  amount: z.number()
    .min(0, 'Amount cannot be negative')
    .max(1000000, 'Amount exceeds maximum allowed')
    .refine((val) => Number.isFinite(val), 'Invalid amount')
    .optional(),
  description: z.string()
    .min(1)
    .max(1000)
    .trim()
    .optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
  dueDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .transform((str) => new Date(str))
    .optional(),
});

const idParamSchema = z.string().min(1, 'ID is required').max(100, 'Invalid ID format');

const getAllBillings = asyncHandler(async (req, res) => {
  const billings = await billingService.getAllBillingRecords();

  res.status(200).json({
    success: true,
    data: billings,
  });
});

const getBillingById = asyncHandler(async (req, res) => {
  const id = idParamSchema.parse(req.params.id);

  const billing = await billingService.getBillingRecordById(id);

  if (!billing) {
    return res.status(404).json({
      success: false,
      message: 'Billing record not found',
    });
  }

  res.status(200).json({
    success: true,
    data: billing,
  });
});

const getBillingsByPatient = asyncHandler(async (req, res) => {
  const patientId = idParamSchema.parse(req.params.patientId);

  const billings = await billingService.getBillingRecordsByPatientId(patientId);

  res.status(200).json({
    success: true,
    data: billings,
  });
});

const getBillingsByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;

  const billings = await billingService.getBillingRecordsByStatus(status);

  res.status(200).json({
    success: true,
    data: billings,
  });
});

const createBilling = asyncHandler(async (req, res) => {
  const validatedData = createBillingSchema.parse(req.body);

  try {
    const billing = await billingService.createBillingRecord(validatedData);

    res.status(201).json({
      success: true,
      data: billing,
      message: 'Billing record created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const updateBilling = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validatedData = updateBillingSchema.parse(req.body);

  try {
    const billing = await billingService.updateBillingRecord(id, validatedData);

    res.status(200).json({
      success: true,
      data: billing,
      message: 'Billing record updated successfully',
    });
  } catch (error) {
    if (error.message === 'Billing record not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const markBillingAsPaid = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const billing = await billingService.markAsPaid(id);

    res.status(200).json({
      success: true,
      data: billing,
      message: 'Billing marked as paid successfully',
    });
  } catch (error) {
    if (error.message === 'Billing record not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const markBillingAsOverdue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const billing = await billingService.markAsOverdue(id);

    res.status(200).json({
      success: true,
      data: billing,
      message: 'Billing marked as overdue successfully',
    });
  } catch (error) {
    if (error.message === 'Billing record not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const getOverdueBillings = asyncHandler(async (req, res) => {
  const overdueBillings = await billingService.getOverdueBillingRecords();

  res.status(200).json({
    success: true,
    data: overdueBillings,
  });
});

const deleteBilling = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await billingService.deleteBillingRecord(id);

    res.status(200).json({
      success: true,
      message: 'Billing record deleted successfully',
    });
  } catch (error) {
    if (error.message === 'Billing record not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = {
  getAllBillings,
  getBillingById,
  getBillingsByPatient,
  getBillingsByStatus,
  createBilling,
  updateBilling,
  markBillingAsPaid,
  markBillingAsOverdue,
  getOverdueBillings,
  deleteBilling,
};