# BillSense Demo Guide

## Quick Start

1. **Setup the application:**
   ```bash
   ./setup.sh
   ```

2. **Start the development servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend  
   cd frontend && npm start
   ```

3. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Demo Flow

### 1. Create a New Bill
- Click "New Bill" on the home page
- Choose between "Scan Receipt" or "Manual Entry"

### 2. Scan Receipt (OCR Demo)
- Upload a receipt image (JPG, PNG, etc.)
- The OCR will extract items, prices, and totals
- Review and edit the extracted data

### 3. Manual Entry
- Enter bill name and details
- Add items manually with name, price, and quantity
- Set tax and tip amounts

### 4. Add Participants
- Add people who will split the bill
- Use the quick-add buttons or enter custom names

### 5. Assign Items
- Click on items to assign them to participants
- Support for partial sharing (percentage-based)
- Visual indicators show assignment status

### 6. Calculate Split
- Click "Calculate Split" to compute fair shares
- Automatic tax and tip distribution
- View detailed breakdown for each person

### 7. Share Results
- Copy individual or full split summaries
- Export results for sharing

## Features to Test

### OCR Scanning
- Upload clear receipt images
- Test with different receipt formats
- Verify item extraction accuracy

### Smart Assignment
- Assign items to multiple people
- Test partial sharing (50/50 splits)
- Bulk assignment features

### Fair Calculation
- Proportional tax/tip distribution
- Rounding error handling
- Complex split scenarios

### User Experience
- Responsive design on mobile/desktop
- Drag and drop interactions
- Real-time updates

## Sample Data

The database comes pre-loaded with sample users:
- John Doe (john@example.com)
- Jane Smith (jane@example.com)
- Bob Johnson (bob@example.com)

## API Testing

You can also test the API directly:

```bash
# Health check
curl http://localhost:5000/health

# Get all bills
curl http://localhost:5000/api/bills

# Create a new bill
curl -X POST http://localhost:5000/api/bills \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Bill","total_amount":50.00,"tax_amount":5.00,"tip_amount":10.00,"created_by":1}'
```

## Troubleshooting

### Database Issues
- Ensure PostgreSQL is running
- Check database credentials in backend/.env
- Run `psql -d billsense -c "\dt"` to verify tables

### OCR Issues
- Ensure image files are clear and well-lit
- Check file size limits (10MB max)
- Verify Tesseract.js is working

### Port Conflicts
- Backend runs on port 5000
- Frontend runs on port 3000
- Change ports in .env files if needed

## Next Steps

1. **Add Authentication:** Implement user login/registration
2. **Payment Integration:** Add Venmo/PayPal integration
3. **Mobile App:** React Native version
4. **Advanced OCR:** Google Vision API integration
5. **Social Features:** Share bills with friends
6. **Analytics:** Spending insights and reports
