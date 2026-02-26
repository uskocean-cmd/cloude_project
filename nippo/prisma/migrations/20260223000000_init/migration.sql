-- CreateTable
CREATE TABLE "sales" (
    "sales_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_supervisor" BOOLEAN NOT NULL DEFAULT false,
    "supervisor_id" INTEGER,
    "department" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("sales_id")
);

-- CreateTable
CREATE TABLE "customers" (
    "customer_id" SERIAL NOT NULL,
    "customer_name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "assigned_sales_id" INTEGER NOT NULL,
    "industry" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "daily_reports" (
    "report_id" SERIAL NOT NULL,
    "sales_id" INTEGER NOT NULL,
    "report_date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "problem" TEXT,
    "plan" TEXT,
    "submitted_at" TIMESTAMPTZ(6),
    "approved_at" TIMESTAMPTZ(6),
    "approved_by" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "daily_reports_pkey" PRIMARY KEY ("report_id")
);

-- CreateTable
CREATE TABLE "visit_records" (
    "visit_id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "visit_content" TEXT NOT NULL,
    "visit_time" TEXT,
    "display_order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "visit_records_pkey" PRIMARY KEY ("visit_id")
);

-- CreateTable
CREATE TABLE "supervisor_comments" (
    "comment_id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "supervisor_id" INTEGER NOT NULL,
    "comment_type" TEXT NOT NULL,
    "comment_text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "supervisor_comments_pkey" PRIMARY KEY ("comment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sales_email_key" ON "sales"("email");

-- CreateIndex
CREATE INDEX "idx_sales_supervisor" ON "sales"("supervisor_id");

-- CreateIndex
CREATE INDEX "idx_customer_sales" ON "customers"("assigned_sales_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_sales_date" ON "daily_reports"("sales_id", "report_date");

-- CreateIndex
CREATE INDEX "idx_daily_report_sales_date" ON "daily_reports"("sales_id", "report_date");

-- CreateIndex
CREATE INDEX "idx_daily_report_status" ON "daily_reports"("status");

-- CreateIndex
CREATE INDEX "idx_daily_report_date" ON "daily_reports"("report_date");

-- CreateIndex
CREATE INDEX "idx_visit_record_report" ON "visit_records"("report_id");

-- CreateIndex
CREATE INDEX "idx_visit_record_customer" ON "visit_records"("customer_id");

-- CreateIndex
CREATE INDEX "idx_comment_report" ON "supervisor_comments"("report_id");

-- CreateIndex
CREATE INDEX "idx_comment_supervisor" ON "supervisor_comments"("supervisor_id");

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "sales"("sales_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_assigned_sales_id_fkey" FOREIGN KEY ("assigned_sales_id") REFERENCES "sales"("sales_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_sales_id_fkey" FOREIGN KEY ("sales_id") REFERENCES "sales"("sales_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "sales"("sales_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_records" ADD CONSTRAINT "visit_records_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "daily_reports"("report_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_records" ADD CONSTRAINT "visit_records_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_comments" ADD CONSTRAINT "supervisor_comments_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "daily_reports"("report_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_comments" ADD CONSTRAINT "supervisor_comments_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "sales"("sales_id") ON DELETE RESTRICT ON UPDATE CASCADE;
