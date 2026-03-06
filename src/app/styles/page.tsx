export default function StylesPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          ChequeMate Admin Style Guide
        </h1>

        {/* Colors Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">Colors</h2>

          {/* Primary Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-text-secondary mb-4">Primary</h3>
            <div className="flex gap-4 flex-wrap">
              <ColorSwatch name="Primary" color="bg-primary" hex="#1A7F64" />
              <ColorSwatch name="Primary Dark" color="bg-primary-dark" hex="#156B54" />
              <ColorSwatch name="Primary Light" color="bg-primary-light" hex="#E8F5F1" textDark />
            </div>
          </div>

          {/* Sidebar Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-text-secondary mb-4">Sidebar</h3>
            <div className="flex gap-4 flex-wrap">
              <ColorSwatch name="Sidebar BG" color="bg-sidebar-bg" hex="#1A7F64" />
              <ColorSwatch name="Sidebar Hover" color="bg-sidebar-hover" hex="#156B54" />
              <ColorSwatch name="Sidebar Active" color="bg-sidebar-active" hex="#0D5A45" />
            </div>
          </div>

          {/* Status Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-text-secondary mb-4">Status</h3>
            <div className="flex gap-4 flex-wrap">
              <ColorSwatch name="Success" color="bg-success" hex="#22C55E" />
              <ColorSwatch name="Success Light" color="bg-success-light" hex="#DCFCE7" textDark />
              <ColorSwatch name="Warning" color="bg-warning" hex="#F59E0B" />
              <ColorSwatch name="Warning Light" color="bg-warning-light" hex="#FEF3C7" textDark />
              <ColorSwatch name="Error" color="bg-error" hex="#EF4444" />
              <ColorSwatch name="Error Light" color="bg-error-light" hex="#FEE2E2" textDark />
              <ColorSwatch name="Info" color="bg-info" hex="#3B82F6" />
              <ColorSwatch name="Info Light" color="bg-info-light" hex="#DBEAFE" textDark />
            </div>
          </div>

          {/* Chart Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-text-secondary mb-4">Chart</h3>
            <div className="flex gap-4 flex-wrap">
              <ColorSwatch name="Active" color="bg-chart-active" hex="#22C55E" />
              <ColorSwatch name="Completed" color="bg-chart-completed" hex="#3B82F6" />
              <ColorSwatch name="Defaulted" color="bg-chart-defaulted" hex="#EF4444" />
            </div>
          </div>

          {/* Text Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-text-secondary mb-4">Text</h3>
            <div className="flex gap-4 flex-wrap">
              <ColorSwatch name="Primary" color="bg-text-primary" hex="#1A1A1A" />
              <ColorSwatch name="Secondary" color="bg-text-secondary" hex="#6B7280" />
              <ColorSwatch name="Muted" color="bg-text-muted" hex="#9CA3AF" />
            </div>
          </div>

          {/* Background & Border Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-text-secondary mb-4">Background & Border</h3>
            <div className="flex gap-4 flex-wrap">
              <ColorSwatch name="Background" color="bg-background" hex="#F8F9FA" textDark border />
              <ColorSwatch name="White" color="bg-background-white" hex="#FFFFFF" textDark border />
              <ColorSwatch name="Card BG" color="bg-card-bg" hex="#FFFFFF" textDark border />
              <ColorSwatch name="Border" color="bg-border" hex="#E5E7EB" textDark border />
              <ColorSwatch name="Border Light" color="bg-border-light" hex="#F3F4F6" textDark border />
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">Typography</h2>

          <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border">
            <div className="space-y-6">
              <div>
                <p className="text-text-muted text-sm mb-2">Font Family: Inter</p>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-text-muted text-sm">text-4xl / 36px</span>
                  <p className="text-4xl font-bold text-text-primary">Dashboard Heading</p>
                </div>
                <div>
                  <span className="text-text-muted text-sm">text-3xl / 30px</span>
                  <p className="text-3xl font-bold text-text-primary">Page Title</p>
                </div>
                <div>
                  <span className="text-text-muted text-sm">text-2xl / 24px</span>
                  <p className="text-2xl font-semibold text-text-primary">Section Header</p>
                </div>
                <div>
                  <span className="text-text-muted text-sm">text-xl / 20px</span>
                  <p className="text-xl font-semibold text-text-primary">Card Title</p>
                </div>
                <div>
                  <span className="text-text-muted text-sm">text-lg / 18px</span>
                  <p className="text-lg font-medium text-text-primary">Subsection</p>
                </div>
                <div>
                  <span className="text-text-muted text-sm">text-base / 16px</span>
                  <p className="text-base text-text-primary">Body text - regular paragraph content.</p>
                </div>
                <div>
                  <span className="text-text-muted text-sm">text-sm / 14px</span>
                  <p className="text-sm text-text-secondary">Secondary text - descriptions, captions.</p>
                </div>
                <div>
                  <span className="text-text-muted text-sm">text-xs / 12px</span>
                  <p className="text-xs text-text-muted">Small text - labels, metadata.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Components Preview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">Components</h2>

          {/* Buttons */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-text-secondary mb-4">Buttons</h3>
            <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border">
              <div className="flex gap-4 flex-wrap items-center">
                <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
                  Primary Button
                </button>
                <button className="px-4 py-2 bg-background-white text-text-primary border border-border rounded-lg font-medium hover:bg-border-light transition-colors">
                  Secondary Button
                </button>
                <button className="px-4 py-2 bg-success text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Success
                </button>
                <button className="px-4 py-2 bg-error text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Danger
                </button>
                <button className="px-4 py-2 bg-warning text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Warning
                </button>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-text-secondary mb-4">Stat Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon="👥"
                label="Total Users"
                value="2,847"
                change="+12.5%"
                positive
              />
              <StatCard
                icon="🔄"
                label="Active Ajo"
                value="2,847"
                change="+12.5%"
                positive
              />
              <StatCard
                icon="💰"
                label="Funds in Circulation"
                value="₦45.2M"
                change="+12.5%"
                positive
              />
              <StatCard
                icon="🔐"
                label="Security Deposit Pool"
                value="₦8.7M"
                change="+12.5%"
                positive
              />
            </div>
          </div>

          {/* Status Badges */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-text-secondary mb-4">Status Badges</h3>
            <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border">
              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1 bg-success-light text-success text-sm font-medium rounded-full">
                  Active
                </span>
                <span className="px-3 py-1 bg-info-light text-info text-sm font-medium rounded-full">
                  Completed
                </span>
                <span className="px-3 py-1 bg-warning-light text-warning text-sm font-medium rounded-full">
                  Pending
                </span>
                <span className="px-3 py-1 bg-error-light text-error text-sm font-medium rounded-full">
                  Defaulted
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Color Swatch Component
function ColorSwatch({
  name,
  color,
  hex,
  textDark = false,
  border = false
}: {
  name: string;
  color: string;
  hex: string;
  textDark?: boolean;
  border?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <div
        className={`w-24 h-24 rounded-lg ${color} ${border ? 'border border-border' : ''} flex items-end p-2`}
      >
        <span className={`text-xs font-mono ${textDark ? 'text-text-primary' : 'text-white'}`}>
          {hex}
        </span>
      </div>
      <span className="text-sm text-text-secondary mt-2">{name}</span>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  change,
  positive
}: {
  icon: string;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="bg-card-bg p-4 rounded-lg shadow-sm border border-border">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-xl">
          {icon}
        </div>
        <span className={`text-sm font-medium ${positive ? 'text-success' : 'text-error'}`}>
          {change}
        </span>
      </div>
      <p className="text-text-muted text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  );
}
