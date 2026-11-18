# Reading-log fixtures

Test-only books, read instead of `content/reading/` when `READING_FIXTURES` is
set (the E2E workflow sets it for the build and the tests). They exercise
`/reading`, a review page, the home Reading section, the sitemap, and the feed
while the real log is empty. Production never sets it.
