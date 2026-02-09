$root = "joey-moves-pro"

# Directories
$dirs = @(
"$root/src/app/(auth)/login",
"$root/src/app/(auth)/register",

"$root/src/app/(customer)/dashboard",
"$root/src/app/(customer)/bookings/[id]",
"$root/src/app/(customer)/bookings/new",

"$root/src/app/(driver)/driver/dashboard",
"$root/src/app/(driver)/driver/jobs",

"$root/src/app/(admin)/admin/operations",
"$root/src/app/(admin)/admin/fleet",
"$root/src/app/(admin)/admin/invoices",

"$root/src/app/api/auth/[...nextauth]",
"$root/src/app/api/jobs/[id]",
"$root/src/app/api/payments/create-intent",
"$root/src/app/api/payments/webhook",
"$root/src/app/api/chat",

"$root/src/components/ui",
"$root/src/components/booking",
"$root/src/components/admin",
"$root/src/components/fleet",
"$root/src/components/invoice",
"$root/src/components/chat",

"$root/src/lib",
"$root/prisma",
"$root/services/websocket",
"$root/emails",
"$root/tests/unit",
"$root/tests/integration",
"$root/tests/e2e"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

# Files
$files = @(
"$root/src/app/(auth)/login/page.tsx",
"$root/src/app/(auth)/register/page.tsx",
"$root/src/app/(auth)/layout.tsx",

"$root/src/app/(customer)/dashboard/page.tsx",
"$root/src/app/(customer)/bookings/page.tsx",
"$root/src/app/(customer)/bookings/[id]/page.tsx",
"$root/src/app/(customer)/bookings/new/page.tsx",
"$root/src/app/(customer)/layout.tsx",

"$root/src/app/(driver)/driver/dashboard/page.tsx",
"$root/src/app/(driver)/driver/jobs/page.tsx",

"$root/src/app/(admin)/admin/operations/page.tsx",
"$root/src/app/(admin)/admin/fleet/page.tsx",
"$root/src/app/(admin)/admin/invoices/page.tsx",

"$root/src/app/api/auth/[...nextauth]/route.ts",
"$root/src/app/api/jobs/route.ts",
"$root/src/app/api/jobs/[id]/route.ts",
"$root/src/app/api/invoices/route.ts",
"$root/src/app/api/payments/create-intent/route.ts",
"$root/src/app/api/payments/webhook/route.ts",
"$root/src/app/api/chat/route.ts",

"$root/src/app/page.tsx",
"$root/src/app/layout.tsx",
"$root/src/app/globals.css",

"$root/src/components/booking/booking-wizard.tsx",
"$root/src/components/admin/operations-board.tsx",
"$root/src/components/fleet/fleet-map.tsx",
"$root/src/components/invoice/invoice-page.tsx",
"$root/src/components/chat/chat-widget.tsx",

"$root/src/lib/db.ts",
"$root/src/lib/auth.ts",
"$root/src/lib/stripe.ts",
"$root/src/lib/email.ts",
"$root/src/lib/maps.ts",
"$root/src/lib/pricing.ts",

"$root/src/middleware.ts",

"$root/prisma/schema.prisma",
"$root/prisma/seed.ts",

"$root/services/websocket/server.ts",

"$root/emails/booking-confirmation.tsx",
"$root/emails/invoice-ready.tsx"
)

foreach ($file in $files) {
    New-Item -ItemType File -Force -Path $file | Out-Null
}

Write-Host "✅ joey-moves-pro created successfully."
