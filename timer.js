
timer
    .pipe(time())
    .pipe(task())
    .pipe(db())
    .pipe(backup())

restore
    .pipe(db())
    .pipe(task())
    .pile(restore())
