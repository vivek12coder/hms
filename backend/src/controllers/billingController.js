const { asyncHandler } = require('../middleware/error');
const { billingService } = require('../services/BillingService');
const { z } = require('zod');

// Validation schemas
const createBillingSchema = z.object({
  patientId: z.string(),
  amount: z.number().min(0),
  description: z.string(),
  dueDate: z.string().transform((str) => new Date(str)).optional(),
});

const updateBillingSchema = z.object({
  amount: z.number().min(0).optional(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
  dueDate: z.string().transform((str) => new Date(str)).optional(),
});

const getAllBillings = asyncHandler(async (req, res) => {
  const billings = await billingService.getAllBillingRecords();

  res.status(200).json({
    success: true,
    data: billings,
  });
});

const getBillingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

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
  const { patientId } = req.params;

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