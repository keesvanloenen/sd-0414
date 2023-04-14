# Rainbow Tables 🌈

1. Assume we've got a huge table, say 32 petabytes in size, with many many passwords (p) and hashes (h).

   ```bash
   p    h
   01  7203
   02  6132
   03  3345★ 👈
   04  2219★
   ...
   19  5286★
   ...
   ```

   An attacker who found hash **_3345_** in a database, could use above table to discover that the original password is **_03_**.

1. Transform above table to 8 columns and
   use the reduction function _"pick the last 2 characters"_:

   ```bash
   p1   h1      p2   h2      p3    h3      p4    h4
   01  7203     03★ 3345    45   7892      92   3316
   02  6132     32  7504    04★  2219     19★  5286
   ...
   ```

   Epxamine the first row:

   The password **_01_** is hashed to **_7202_**. The reduction function picks **_03_** and stores it in column p2. This value is hashed to **_3345_**. The reduction function picks **_45_** etc.

   We now have more columns and less rows. Six passwords don't require separate rows anymore.

1. What if we remove all columns except first and last?

   ```bash
   p1   h1      p2   h2      p3    h3      p4    h4
   01  7203     03★ 3345    45   7892      92   3316
   02  6132     32  7504    04★  2219     19★  5286

   👇

   p1   h4
   01  3316
   02  5286
   ```

   This would be a much much smaller table than before. But could we still find the password **_03_** when hash **_3345_** is given?

   Yes!  
   How?

   Assume we want to (again) know the password belonging to hash **_3345_**...

   a. Pick the last 2 digits from **_3345_** which is **_45_**\
   b. Hash this value: result = **_7892_**\
   c. Is this result in column 2? No, continue\
   d. Apply the reduction function: **_92_**\
   e. Hash this value: result = **_2107_**\
   f. Is this result in column 2? Yes!\
   g. Now go to the first password in that same row: **_01_**\
   h. Hash this value: result = **_7203_**. Is this the value we're looking for? No, continue\
   i. Apply the reduction function: **_03_**..\
   j. Hash this value: result = **_3345_**. Is this the value we're looking for? Yes, done! The password is **_03_**

Three remarks:

- in this explanation we assume there are no salt values!
- if 2 different passwords have the same hash, the attacker needs to repeat some steps
- in rainbow tables _more clever_ and _different_ reduction functions are used. Imagine every reduction function stands for another color... That's where the name rainbow table comes from!

---

Great article: <https://www.ionos.com/digitalguide/server/security/rainbow-tables/>
