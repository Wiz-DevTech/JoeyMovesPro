#!/usr/bin/env bash

set -e

ROOT="joey-moves-pro"

# Create directories
mkdir -p $ROOT/src/app/{\(auth\),\(customer\)/bookings/{[id],new},\(driver\)/driver/{dashboard,jobs},\(admin\)/admin,api/{auth/[...nextauth],jobs/[id],payments/{create-intent,webhook}}}
mkdir -p $ROOT/src/components/{ui,booking,admin,fleet,invoice,chat}
mkdir -p $ROOT/src/lib
mkdir -p $ROOT/prisma
mkdir -p $ROOT/services/websocket
mkdir -p $ROOT/emails
mkdir -p $ROOT/tests/{unit,integration,e2e}

# App pages & layouts
touch \
$ROOT/src/app/\(auth\)/{login/page.tsx,register/page.tsx,layout.tsx} \
$ROOT/src/app/\(customer\)/dashboard/page.tsx \
$ROOT/src/app/\(customer\)/bookings/{page.tsx,[id]/page.tsx,new/page.tsx} \
$ROOT/src/app/\(customer\)/layout.tsx \
$ROOT/src/app/\(driver\)/driver/{dashboard/page.tsx,jobs/page.tsx} \
$ROOT/src/app/\(admin\)/admin/{operations/page.tsx,fleet/page.tsx,invoices/page.tsx} \
$ROOT/src/app/api/auth/[...nextauth]/route.ts \
$ROOT/src/app/api/jobs/{route.ts,[id]/route.ts} \
$ROOT/src/app/api/invoices/route.ts \
$ROOT/src/app/api/payments/{create-intent/route.ts,webhook/route.ts} \
$ROOT/src/app/api/chat/route.ts \
$ROOT/src/app/{page.tsx,layout.tsx,globals.css}

# Components
touch \
$ROOT/src/components/booking/booking-wizard.tsx \
$ROOT/src/components/admin/operations-board.tsx \
$ROOT/src/components/fleet/fleet-map.tsx \
$ROOT/src/components/invoice/invoice-page.tsx \
$ROOT/src/components/chat/chat-widget.tsx

# Lib
touch \
$ROOT/src/lib/{db.ts,auth.ts,stripe.ts,email.ts,maps.ts,pricing.ts}

# Middleware
touch $ROOT/src/middleware.ts

# Prisma
touch \
$ROOT/prisma/schema.prisma \
$ROOT/prisma/seed.ts

# Services
touch $ROOT/services/websocket/server.ts

# Emails
touch \
$ROOT/emails/{booking-confirmation.tsx,invoice-ready.tsx}

echo "✅ joey-moves-pro scaffold created."
