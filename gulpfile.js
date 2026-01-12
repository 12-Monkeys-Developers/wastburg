const gulp = require('gulp');
const less = require('gulp-less');

/* ----------------------------------------- */
/*  Compile LESS
/* ----------------------------------------- */

function compileLESS() {
  return gulp.src("styles/wastburg.less")
    .pipe(less())
    .on('error', function(err) {
      console.error('[ERROR LESS]:', err.message);
      this.emit('end');
    })
    .pipe(gulp.dest("./css"))
}

const css = gulp.series(compileLESS);

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

const LESS_FILES = ["styles/**/*.less"];

function watchUpdates() {
  gulp.watch(LESS_FILES, css);
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.default = gulp.series(
  gulp.parallel(css),
  watchUpdates
);
exports.css = css;
exports.build = css;
exports.watchUpdates = watchUpdates;
