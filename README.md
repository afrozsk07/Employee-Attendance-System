# Employee Attendance System

A full-stack employee attendance tracking system with role-based access control for employees and managers.

## Tech Stack

- **Frontend**: React + Redux Toolkit
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Features

### Employee Features
- Register/Login
- Mark attendance (Check In / Check Out)
- View attendance history (calendar and table view)
- View monthly summary (Present/Absent/Late days)
- Dashboard with statistics
- Profile page

### Manager Features
- Login
- View all employees attendance
- Filter by employee, date, status
- View team attendance summary
- Export attendance reports (CSV)
- Dashboard with team statistics
- Team calendar view
- Department-wise attendance charts

## Project Structure

```
Employee-Attendance-System/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Attendance.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── attendance.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js
│   ├── scripts/
│   │   └── seed.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Employee-Attendance-System
```

### 2. Install Dependencies

Install all dependencies for root, backend, and frontend:

```bash
npm run install-all
```

Or install manually:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Variables

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
# Copy the example file (rename env.example to .env)
# On Windows: copy env.example .env
# On Linux/Mac: cp env.example .env
```

Or create a new `.env` file manually with the following content:

Edit `.env` file with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance-system
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

**Note**: 
- For MongoDB Atlas, use your connection string: `mongodb+srv://username:password@cluster.mongodb.net/attendance-system`
- Change `JWT_SECRET` to a secure random string in production

#### Frontend Environment Variables (Optional)

Create a `.env` file in the `frontend` directory if you need to change the API URL:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For local MongoDB
GET Service MongoDB

# Or if using MongoDB as a service
# Windows: net start MongoDB
# macOS/Linux: sudo systemctl start mongod
```

### 5. Seed the Database (Optional)

Populate the database with sample data:

```bash
cd backend
npm run seed
```

This will create:
- 1 Manager account (email: `manager@example.com`, password: `manager123`)
- 5 Employee accounts (emails: `alice@example.com`, `bob@example.com`, etc., password: `employee123`)
- Sample attendance records for the last 30 days

### 6. Run the Application

#### Option 1: Run Both Backend and Frontend Together

From the root directory:

```bash
npm run dev
```

#### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new employee
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Attendance (Employee)
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/my-history` - Get my attendance history
- `GET /api/attendance/my-summary` - Get monthly summary
- `GET /api/attendance/today` - Get today's status

### Attendance (Manager)
- `GET /api/attendance/all` - Get all employees attendance
- `GET /api/attendance/employee/:id` - Get specific employee attendance
- `GET /api/attendance/summary` - Get team summary
- `GET /api/attendance/export` - Export CSV
- `GET /api/attendance/today-status` - Get today's status for all

### Dashboard
- `GET /api/dashboard/employee` - Employee dashboard stats
- `GET /api/dashboard/manager` - Manager dashboard stats

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (employee/manager),
  employeeId: String (unique),
  department: String,
  createdAt: Date
}
```

### Attendance Model
```javascript
{
  userId: ObjectId (ref: User),
  date: Date,
  checkInTime: Date,
  checkOutTime: Date,
  status: String (present/absent/late/half-day),
  totalHours: Number,
  createdAt: Date
}
```

## Default Login Credentials

After running the seed script:

### Manager
- Email: `manager@example.com`
- Password: `manager123`

### Employees
- Email: `alice@example.com` (or bob@example.com, charlie@example.com, etc.)
- Password: `employee123`

## Features Overview

### Employee Dashboard
- Today's attendance status
- Monthly statistics (Present/Absent/Late days)
- Total hours worked
- Recent attendance history (last 7 days)
- Quick check-in/check-out buttons

### Manager Dashboard
- Total employees count
- Today's attendance statistics
- Late arrivals today
- Weekly attendance trend chart
- Department-wise attendance chart
- List of absent employees today

### Attendance History (Employee)
- Calendar view with color coding
- Table view with all records
- Monthly summary statistics
- Filter by month/year

### Team Calendar (Manager)
- Calendar view showing attendance for all employees
- Click on date to see detailed attendance
- Filter by month/year

### Reports (Manager)
- Export attendance data to CSV
- Filter by date range and employee
- Download reports for analysis

## Development

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the `MONGODB_URI` in `.env` file
- For MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use
- Change the `PORT` in backend `.env` file
- Update `REACT_APP_API_URL` in frontend `.env` if needed

### CORS Issues
- Backend CORS is configured to allow requests from `http://localhost:3000`
- If using a different port, update CORS settings in `backend/server.js`

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Use a strong `JWT_SECRET`
3. Use a secure MongoDB connection string
4. Build the frontend: `cd frontend && npm run build`
5. Serve the frontend build using a web server (nginx, Apache, etc.)
6. Use PM2 or similar process manager for the backend

## Screenshots

![Login Page](screenshots/Login.png)

![Employee Dashboard](screenshots/Employee%20dashboard.png)

![Employee Mark Attendance](screenshots/Employee%20mark-attendace.png)

![Employee Attendance History](screenshots/Employee%20attendance%20history.png)

![Employee Apply Leave](screenshots/employee%20apply%20leave.png)

![Employee Raise Trouble](screenshots/Employee%20problem%20reporting.png)

![Employee Profile](screenshots/Employee%20Profile.png)

![Employee Profile Stats](screenshots/Employee%20Profile%20stats.png)

![Manager Dashboard](screenshots/Manager%20dashboard.png)

![Manager Profile](screenshots/Manager%20Profile.png)

![All Employee Attendace](screenshots/Manager%20all%20employee%20attendance.png)

![Employee Attendance Ranking](screenshots/Manager%20-%20Employee%20attendance%20ranking.png)

![Team Calender View](screenshots/Team%20Calender%20view.png)

![Attendance Reports](screenshots/Attendace%20Reports.png)

![Handle Leave Requests](screenshots/Handle%20Leave%20Requests.png)

![Troubleshoot Reports](screenshots/Troubleshoot%20Reports.png)

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the GitHub repository.

