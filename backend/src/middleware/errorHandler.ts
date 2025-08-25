import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types/bill.types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Multer errors
  if (error.message === 'Only image files are allowed!') {
    res.status(400).json({
      success: false,
      message: 'Only image files are allowed',
      code: 'INVALID_FILE_TYPE'
    });
    return;
  }

  if (error.message.includes('File too large')) {
    res.status(400).json({
      success: false,
      message: 'File size too large',
      code: 'FILE_TOO_LARGE'
    });
    return;
  }

  // Database errors
  if (error.message.includes('duplicate key')) {
    res.status(409).json({
      success: false,
      message: 'Resource already exists',
      code: 'DUPLICATE_RESOURCE'
    });
    return;
  }

  if (error.message.includes('foreign key')) {
    res.status(400).json({
      success: false,
      message: 'Invalid reference to related resource',
      code: 'INVALID_REFERENCE'
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'NOT_FOUND'
  });
};
