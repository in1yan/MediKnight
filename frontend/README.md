# Healthcare Security & Access Control Platform

A comprehensive demonstration of a secure healthcare dashboard platform built with Next.js 16, featuring role-based access control (RBAC), multi-factor authentication (MFA), and security-focused UI components.

## Overview

This platform showcases professional healthcare system architecture with:

- **4 Role Types**: Patient, Doctor, Nurse, and Admin with customized experiences
- **Multi-Factor Authentication**: OTP-based security verification
- **Role-Based Access Control**: Permission-based UI restrictions and sensitive action confirmations
- **Audit Logging**: Comprehensive activity tracking and security events
- **Security-First Design**: Permission badges, access denied screens, break-glass access requests

## Features

### Authentication System
- **Login/Signup**: Secure auth pages with form validation
- **MFA Verification**: 6-digit OTP input with paste support
- **Password Reset**: Multi-step recovery flow
- **Session Management**: Persistent auth state with localStorage

### Role-Based Dashboards

#### Patient Dashboard
- View personal medical records
- Manage prescriptions
- Track appointments
- Access personal health data

#### Doctor Dashboard
- Manage patient list
- View and edit patient records
- Prescribe medications
- Access test results

#### Nurse Dashboard
- Monitor patient vitals
- View alerts and notifications
- Coordinate patient care
- Track daily tasks

#### Admin Dashboard
- User management and permissions
- Audit log review
- System settings
- Security monitoring

### Security Features
- **Permission Badges**: Visual indicators of available actions
- **Sensitive Action Modals**: Confirmation dialogs for critical operations
- **Restricted Sections**: Component-level access control
- **Security Status Widget**: Session information and MFA status
- **Activity Timeline**: Audit trail visualization
- **Break-Glass Access**: Emergency access with logging

## Demo Credentials

### Patient
- **Email**: patient@example.com
- **Password**: password
- **Code**: 000000 or 123456

### Doctor
- **Email**: doctor@example.com
- **Password**: password
- **Code**: 000000 or 123456

### Nurse
- **Email**: nurse@example.com
- **Password**: password
- **Code**: 000000 or 123456

### Admin
- **Email**: admin@example.com
- **Password**: password
- **Code**: 000000 or 123456

## Project Structure

```
app/
├── page.tsx                          # Landing page with role selector
├── auth/
│   ├── login/page.tsx               # Login page
│   ├── signup/page.tsx              # Patient signup
│   ├── mfa/page.tsx                 # MFA verification
│   └── forgot-password/page.tsx     # Password reset
└── dashboard/
    ├── patient/page.tsx             # Patient dashboard
    ├── doctor/page.tsx              # Doctor dashboard
    ├── doctor/records/page.tsx      # Doctor records view
    ├── nurse/page.tsx               # Nurse dashboard
    ├── admin/page.tsx               # Admin dashboard
    ├── admin/users/page.tsx         # Admin user management
    ├── admin/audit-logs/page.tsx    # Admin audit logs
    ├── profile/page.tsx             # User profile
    └── settings/page.tsx            # Account settings

components/
├── auth/
│   ├── login-form.tsx               # Login form component
│   ├── signup-form.tsx              # Signup form component
│   ├── mfa-form.tsx                 # MFA form component
│   ├── mfa-input.tsx                # MFA input field
│   └── forgot-password-form.tsx    # Password reset form
├── access-control/
│   ├── permission-badge.tsx         # Permission display component
│   ├── role-indicator.tsx           # Role display component
│   └── restricted-section.tsx       # Access control wrapper
├── modals/
│   └── sensitive-action-modal.tsx   # Sensitive action confirmation
├── dashboard/
│   ├── security-status.tsx          # Security info widget
│   ├── activity-timeline.tsx        # Audit log timeline
│   ├── stats-cards.tsx              # Dashboard KPI cards
│   └── patient-list-table.tsx       # Patient records table
└── layout/
    ├── sidebar.tsx                  # Role-aware navigation
    ├── navbar.tsx                   # Top navigation bar
    └── dashboard-layout.tsx         # Dashboard wrapper component

lib/
├── types.ts                         # TypeScript type definitions
├── constants.ts                     # Role definitions and mock data
└── auth-context.tsx                 # Global auth state management
```

## Key Components

### Authentication Context (`lib/auth-context.tsx`)
Manages global auth state using React Context API with localStorage persistence:
- User login/logout
- Session management
- Permission checking

### Type System (`lib/types.ts`)
- `User`: User account information with role and permissions
- `Permission`: Granular permission types
- `UserRole`: Available role types
- `PatientRecord`, `Prescription`, `AuditLog`: Data models

### Dashboard Layout (`components/layout/dashboard-layout.tsx`)
- Role-based route protection
- Sidebar and navbar integration
- Responsive design support

### Restricted Section (`components/access-control/restricted-section.tsx`)
- Permission-based component rendering
- Flexible fallback UI
- Break-glass access requests

### Sensitive Action Modal (`components/modals/sensitive-action-modal.tsx`)
- Confirmation text validation
- Risk level indicators
- Loading states and error handling

## Permissions System

### Available Permissions
- `view_own_records`: View personal medical records
- `view_patient_records`: View patient medical information
- `edit_patient_records`: Edit patient medical records
- `prescribe_medication`: Create and manage prescriptions
- `manage_users`: Manage user accounts and roles
- `view_audit_logs`: Access system audit trails
- `break_glass_access`: Emergency access with security logging

### Role-Permission Mapping
- **Patient**: view_own_records
- **Doctor**: view_patient_records, edit_patient_records, prescribe_medication
- **Nurse**: view_patient_records
- **Admin**: manage_users, view_audit_logs, view_patient_records

## Design System

### Color Palette
- **Primary Blue**: #0066cc - Trust and healthcare
- **Success Green**: #10b981 - Secure status
- **Warning Orange**: #f59e0b - Caution/Break glass
- **Error Red**: #ef4444 - Restricted/Denied
- **Neutral Gray**: #6b7280 - Secondary text

### Typography
- **Headings**: Geist Sans (bold weights)
- **Body**: Geist Sans (regular weight)
- **Code**: Geist Mono

### Components
Built with shadcn/ui components:
- Cards, Buttons, Inputs, Dialogs
- Dropdowns, Badges, Alerts
- Avatars, Scrollable areas

## Getting Started

### Installation
```bash
npm install
# or
pnpm install
```

### Development
```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3000` to start.

### Deployment
```bash
npm run build
npm start
```

## Usage Examples

### Checking User Permissions
```tsx
import { useAuth } from '@/lib/auth-context';

function MyComponent() {
  const { user } = useAuth();
  
  const hasPermission = user?.permissions.includes('view_patient_records');
  
  return hasPermission ? <Content /> : <AccessDenied />;
}
```

### Using Restricted Section
```tsx
import { RestrictedSection } from '@/components/access-control/restricted-section';

<RestrictedSection requiredPermission="prescribe_medication">
  <PrescriptionForm />
</RestrictedSection>
```

### Sensitive Action Modal
```tsx
const [isOpen, setIsOpen] = useState(false);

<SensitiveActionModal
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Delete User"
  description="This action cannot be undone"
  actionName="Delete"
  confirmationText="DELETE"
  onConfirm={handleDelete}
  isDestructive
  riskLevel="high"
>
  <p>Confirm that you want to delete this user?</p>
</SensitiveActionModal>
```

## Security Considerations

This is a demonstration platform. In production:

1. **Authentication**: Implement proper OAuth/JWT with backend verification
2. **Passwords**: Never hardcode demo credentials; use secure password hashing (bcrypt)
3. **Sessions**: Use HTTP-only secure cookies instead of localStorage
4. **API Security**: Implement proper API authentication and rate limiting
5. **Audit Logs**: Store in secure database with immutable records
6. **HTTPS**: Always use HTTPS for production
7. **Input Validation**: Validate and sanitize all user inputs server-side
8. **Data Encryption**: Encrypt sensitive data both in transit and at rest

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Technologies

- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS
- **shadcn/ui**: Component library
- **Lucide React**: Icon library
- **date-fns**: Date formatting
- **React Hook Form**: Form state management

## Performance Optimizations

- Server Components for reduced bundle size
- Code splitting via dynamic imports
- Image optimization
- CSS-in-JS with Tailwind CSS
- Responsive design with mobile-first approach

## Accessibility

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader friendly

## Future Enhancements

- Real backend API integration
- Database persistence (Supabase, Neon, etc.)
- Advanced filtering and search
- Export functionality (PDF, CSV)
- Notification system
- Real-time updates via WebSockets
- Dark/light mode toggle UI
- Mobile app version
- Two-factor authentication options
- Multi-language support

## License

This project is for educational and demonstration purposes.

## Support

For issues or questions, refer to the inline code documentation and component README files within each directory.
