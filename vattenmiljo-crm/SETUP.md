# Vattenmiljö CRM - Setup Guide

## 🚀 Getting Started

This guide will walk you through setting up the Vattenmiljö CRM system with secure authentication and data storage.

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account
- Git

## 🔧 Installation Steps

### 1. Clone and Install

```bash
git clone <repository-url>
cd vattenmiljo-crm
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your project URL and keys
3. Go to Settings → Database and note your connection string

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# NextAuth.js Configuration
NEXTAUTH_SECRET=your-super-secure-secret-key-at-least-32-characters-long
NEXTAUTH_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database URL
DATABASE_URL=postgresql://your-database-connection-string
```

### 4. Database Setup

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the migration to create all tables and initial data

### 5. Storage Setup

1. In Supabase, go to Storage
2. Create a new bucket called `customer-files`
3. Set the bucket to public if you want direct file access, or keep private for more security

### 6. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔐 Default Login Credentials

The system creates several demo users:

- **Admin**: `admin@vattenmiljo.se` / `admin123!`
- **Salesperson**: `demo.saljare@vattenmiljo.se` / `admin123!`
- **Internal**: `demo.intern@vattenmiljo.se` / `admin123!`
- **Installer**: `demo.montor@vattenmiljo.se` / `admin123!`

**⚠️ Important**: Change these passwords immediately in production!

## 👥 User Roles

### Salesperson (Säljare)
- Create and edit customers
- View assigned customers
- Update customer status (not_handled → meeting → sales)
- Add notes and upload files

### Internal (Intern Personal)
- All salesperson permissions
- Process sales customers (sales → done)
- Archive customers
- Access to analytics and reports
- Manage backup system

### Installer (Montör)
- View customers ready for installation
- Update installation status (done → installed)
- Add notes and photos
- Upload completion documentation

## 🔄 Data Flow

1. **Salesperson** creates customer (status: not_handled)
2. **Salesperson** books meeting (status: meeting)
3. **Salesperson** completes sale (status: sales)
4. **Internal** processes paperwork (status: done)
5. **Installer** completes installation (status: installed)
6. **Internal** archives completed customers

## 📁 File Management

- Files are stored securely in Supabase Storage
- Maximum file size: 10MB
- Supported formats: Images, PDFs, Word docs, Excel sheets, text files
- Files are organized by customer ID
- All uploads are logged and tracked

## 💾 Backup System

The system includes automated backup capabilities:

### Backup Types
- **Database**: All customer, user, and activity data
- **Files**: All uploaded documents and images
- **Full**: Combined database and file backup

### Accessing Backups
Only Internal users can:
- Trigger manual backups via API: `POST /api/backups`
- View backup history: `GET /api/backups`
- Cleanup old backups: `POST /api/backups/cleanup`

### Backup Schedule
- Automatic daily backups at 2 AM
- Retention: 7 daily, 4 weekly, 12 monthly
- Failed backups are logged for review

## 🔒 Security Features

### Authentication
- Secure password hashing with bcrypt
- JWT session tokens
- Route protection middleware
- Role-based access control

### Data Protection
- Row Level Security (RLS) enabled
- Input validation and sanitization
- SQL injection prevention
- File type and size validation

### Privacy
- Private notes support
- User activity logging
- Secure file storage
- HTTPS enforcement

## 🚀 Production Deployment

### Environment Variables
Update your production `.env.local`:

```env
NEXTAUTH_URL=https://your-domain.com
# ... other production values
```

### Database Security
1. Enable RLS on all tables
2. Create appropriate policies for your use case
3. Use strong passwords for database users
4. Enable database backups

### File Storage
1. Configure proper bucket policies
2. Set up CDN if needed
3. Enable virus scanning (optional)
4. Monitor storage usage

### Monitoring
- Set up error tracking (Sentry, etc.)
- Monitor API usage and performance
- Set up backup failure alerts
- Track user activity logs

## 🔧 Configuration Options

### Customizing User Roles
Edit `lib/constants.ts` to modify:
- Role permissions
- Status transitions
- Priority levels
- Activity types

### Backup Configuration
Edit `lib/backup.ts` to customize:
- Backup schedule
- Retention periods
- Storage locations
- Backup types

## 🆘 Troubleshooting

### Common Issues

**Authentication not working**
- Check NEXTAUTH_SECRET is set
- Verify Supabase keys are correct
- Ensure database connection is working

**File uploads failing**
- Check Supabase storage bucket exists
- Verify bucket permissions
- Check file size limits

**Database errors**
- Ensure migrations have been run
- Check connection string
- Verify table permissions

**Backup failures**
- Check storage permissions
- Verify service role key
- Review error logs in backup_logs table

## 📞 Support

For technical support:
1. Check the error logs in your browser console
2. Review Supabase logs in the dashboard
3. Check the backup_logs table for backup issues
4. Verify all environment variables are set correctly

## 🔄 Updates and Maintenance

### Regular Tasks
- Review and update user passwords
- Monitor backup success rates
- Clean up old files and backups
- Update dependencies regularly
- Review user access and permissions

### Data Export
The system supports exporting customer data:
- Database backups include all customer information
- Individual customer data can be retrieved via API
- Files can be bulk downloaded from storage

## 📈 Scaling Considerations

### Performance
- Index frequently queried columns
- Implement pagination for large datasets
- Use CDN for file delivery
- Consider read replicas for reporting

### Storage
- Monitor file storage usage
- Implement file compression
- Set up automated cleanup policies
- Consider multiple storage regions

This completes the setup guide for the Vattenmiljö CRM system. The system is now ready for production use with secure authentication, persistent data storage, and automated backups.