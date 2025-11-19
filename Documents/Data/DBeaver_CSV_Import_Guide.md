# DBeaver CSV Import Guide

This guide provides step-by-step instructions for importing CSV data into a PostgreSQL table using DBeaver.

## Method 1: Using DBeaver's Import Data Wizard (Recommended)

### Step 1: Prepare Your CSV File
- Ensure your CSV file is properly formatted with headers
- Check that column names match your table structure (or be prepared to map them)
- Verify data types are compatible with your table schema

### Step 2: Connect to Your Database
1. Open DBeaver and establish a connection to your PostgreSQL database
2. Navigate to the database and schema where your table exists
3. Expand the database tree to locate your target table (e.g., `frontier_reviews`)

### Step 3: Open the Import Wizard
1. **Right-click** on your target table in the Database Navigator
2. Select **"Import Data"** from the context menu
   - Alternatively, you can select the table and go to **Database → Import Data**

### Step 4: Select Data Source
1. In the Import Data wizard, choose **"CSV"** as your data source
2. Click **"Next"**

### Step 5: Configure CSV Import Settings
1. **Browse** and select your CSV file (e.g., `FRONTIER_REVIEWS_OPTIMIZED.csv`)
2. Configure CSV parsing options:
   - **Delimiter**: Comma (`,`)
   - **Quote character**: Double quote (`"`)
   - **Escape character**: Backslash (`\`) or double quote
   - **Header row**: Check this box if your CSV has column headers (recommended)
   - **Skip rows**: Set to 0 (or adjust if you need to skip header rows)
   - **Encoding**: UTF-8 (default, adjust if needed)
3. **Preview** the data to verify it's being parsed correctly
4. Click **"Next"**

### Step 6: Map Columns
1. DBeaver will attempt to auto-map columns based on names
2. Review the column mappings:
   - **Source column** (from CSV) → **Target column** (in table)
   - Verify each mapping is correct
   - For columns that don't match, manually select the correct target column
   - Uncheck columns you don't want to import
3. For columns with data type mismatches, you may need to:
   - Adjust the import settings
   - Or handle them in a post-import step
4. Click **"Next"**

### Step 7: Configure Import Options
1. **Import mode**:
   - **Insert**: Adds new rows (use if table is empty or you want to add new records)
   - **Update**: Updates existing rows based on a key
   - **Merge**: Inserts new rows and updates existing ones
2. **On duplicate key**:
   - Choose how to handle duplicates (Skip, Update, or Error)
3. **Batch size**: Leave default (1000-10000) for optimal performance
4. **Transaction mode**: 
   - **Single transaction**: All rows in one transaction (safer, but slower)
   - **Auto-commit**: Each batch commits separately (faster, but less safe)
5. Click **"Next"**

### Step 8: Review and Execute
1. Review the summary of import settings
2. Optionally check **"Open SQL script"** to see the generated SQL
3. Click **"Start"** to begin the import
4. Monitor the progress bar
5. Review the import results summary when complete

---

## Method 2: Using SQL COPY Command (For PostgreSQL)

### Step 1: Prepare CSV File
- Ensure CSV file path is accessible from the database server
- Or use a local file path if using DBeaver's local file import

### Step 2: Open SQL Editor
1. In DBeaver, open a **SQL Editor** (right-click database → SQL Editor)
2. Or use the SQL Editor tab

### Step 3: Write COPY Command
```sql
-- Basic COPY command
COPY frontier_reviews (
    review_id, platform, review_date, rating, reviewer_name, 
    location, review_text, helpful_count, review_url, title, 
    verified_reviewer, verified_customer, local_guide
)
FROM 'C:\hackathon\Pegasus-hack-ai-thon\Documents\Data\FRONTIER_REVIEWS_OPTIMIZED.csv'
WITH (
    FORMAT csv,
    HEADER true,
    DELIMITER ',',
    QUOTE '"',
    ESCAPE '"',
    ENCODING 'UTF8'
);
```

**Note**: The file path must be accessible by the PostgreSQL server. For local files, you may need to use `\copy` instead (client-side command).

### Step 4: Alternative - Using \copy (Client-Side)
If the file is on your local machine and not accessible by the server:
```sql
\copy frontier_reviews (
    review_id, platform, review_date, rating, reviewer_name, 
    location, review_text, helpful_count, review_url, title, 
    verified_reviewer, verified_customer, local_guide
)
FROM 'C:\hackathon\Pegasus-hack-ai-thon\Documents\Data\FRONTIER_REVIEWS_OPTIMIZED.csv'
WITH (
    FORMAT csv,
    HEADER true,
    DELIMITER ',',
    QUOTE '"',
    ESCAPE '"',
    ENCODING 'UTF8'
);
```

### Step 5: Execute
1. Execute the SQL command (F5 or click Execute)
2. Check for any errors
3. Verify row count: `SELECT COUNT(*) FROM frontier_reviews;`

---

## Method 3: Using DBeaver's Table Data Editor

### Step 1: Open Table Data
1. Right-click your table → **"View Data"**
2. Or double-click the table

### Step 2: Import from Clipboard/File
1. In the Data tab, click the **"Import"** button (or right-click in the grid)
2. Select **"Import from file"** or **"Import from clipboard"**
3. Choose CSV format
4. Follow similar mapping steps as Method 1

---

## Troubleshooting Common Issues

### Issue: Column Mismatch
**Solution**: 
- Check that CSV column names match table column names (case-sensitive)
- Or manually map columns in the import wizard
- For columns not in CSV, ensure they have DEFAULT values or are nullable

### Issue: Data Type Errors
**Solution**:
- Verify date formats match (e.g., `YYYY-MM-DD` for DATE columns)
- Check numeric formats (no currency symbols, proper decimal separators)
- Ensure boolean values are properly formatted (TRUE/FALSE, 1/0, etc.)

### Issue: Encoding Problems
**Solution**:
- Ensure CSV is saved as UTF-8
- In import wizard, try different encoding options (UTF-8, Windows-1252, ISO-8859-1)

### Issue: Quote/Escape Character Issues
**Solution**:
- If your CSV has text fields with commas, ensure they're properly quoted
- Adjust quote and escape characters in import settings
- Check for unescaped quotes in text fields

### Issue: Duplicate Key Errors
**Solution**:
- If importing into a table with existing data, use UPDATE or MERGE mode
- Or set "On duplicate key" to Skip or Update
- For UNIQUE constraints, ensure CSV doesn't contain duplicates

### Issue: Date Format Errors
**Solution**:
- Ensure dates are in format matching your database (typically `YYYY-MM-DD`)
- Use a pre-processing step to format dates if needed
- Or import as text and convert with SQL: `TO_DATE(column_name, 'YYYY-MM-DD')`

---

## Best Practices

1. **Backup First**: Always backup your table before importing large datasets
   ```sql
   CREATE TABLE frontier_reviews_backup AS SELECT * FROM frontier_reviews;
   ```

2. **Test with Small Sample**: Import a small subset first to verify mappings

3. **Validate Data**: After import, run validation queries:
   ```sql
   -- Check row count
   SELECT COUNT(*) FROM frontier_reviews;
   
   -- Check for NULLs in required fields
   SELECT COUNT(*) FROM frontier_reviews WHERE review_id IS NULL;
   
   -- Check data ranges
   SELECT MIN(rating), MAX(rating) FROM frontier_reviews;
   ```

4. **Use Transactions**: For large imports, consider wrapping in a transaction:
   ```sql
   BEGIN;
   -- Your import operation
   COMMIT; -- or ROLLBACK if issues found
   ```

5. **Handle Auto-Increment IDs**: If your table has SERIAL/IDENTITY columns, ensure CSV either:
   - Doesn't include the ID column (let database generate it)
   - Or includes IDs and handles conflicts appropriately

---

## Quick Reference: Import Settings for FRONTIER_REVIEWS_OPTIMIZED.csv

Based on your CSV structure, recommended settings:

- **Delimiter**: `,` (comma)
- **Quote**: `"` (double quote)
- **Escape**: `"` (double quote) or `\` (backslash)
- **Header**: Yes (first row contains column names)
- **Encoding**: UTF-8
- **Skip rows**: 0
- **Import mode**: Insert (for new data) or Merge (to update existing)

---

## Additional Resources

- DBeaver Documentation: https://dbeaver.com/docs/
- PostgreSQL COPY Documentation: https://www.postgresql.org/docs/current/sql-copy.html
- CSV Format Specification: RFC 4180

