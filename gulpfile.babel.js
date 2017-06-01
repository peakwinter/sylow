import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import path from 'path';
import del from 'del';
import runSequence from 'run-sequence';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import webpackConfig from './webpack.config';

const plugins = gulpLoadPlugins();

const paths = {
  js: ['./**/*.js', '!admin/**', '!dist/**', '!node_modules/**', '!coverage/**'],
  frontend: ['./admin/**/*.js', './admin/assets/**/*.scss'],
  nonJs: ['./**/*.pug', './package.json', './.gitignore', './.env'],
  tests: './server/tests/*.js'
};

// Clean up dist and coverage directory
gulp.task('clean', () =>
  del.sync(['dist/**', 'dist/.*', 'coverage/**', '!dist', '!coverage'])
);

// Copy non-js files to dist
gulp.task('copy', () =>
  gulp.src(paths.nonJs)
    .pipe(plugins.newer('dist'))
    .pipe(gulp.dest('dist'))
);

// Compile ES6 to ES5 and copy to dist
gulp.task('babel', () =>
  gulp.src([...paths.js, '!gulpfile.babel.js', '!webpack.config.js'], { base: '.' })
    .pipe(plugins.newer('dist'))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.babel())
    .pipe(plugins.sourcemaps.write('.', {
      includeContent: false,
      sourceRoot(file) {
        return path.relative(file.path, __dirname);
      }
    }))
    .pipe(gulp.dest('dist'))
);

gulp.task('build:frontend', () =>
  gulp.src([...paths.frontend])
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest('dist/admin/assets'))
);

// Start server with restart on file changes
gulp.task('nodemon', ['build:frontend', 'copy', 'babel'], () => {
  gulp.watch(paths.nonJs, ['copy']);
  gulp.watch(paths.frontend, ['build:frontend']);
  return plugins.nodemon({
    script: path.join('dist', 'index.js'),
    ext: 'js',
    watch: ['server/**/*.js'],
    ignore: ['node_modules/**/*.js', 'dist/**/*.js'],
    tasks: ['babel']
  });
});

// gulp serve for development
gulp.task('serve', ['clean'], () => runSequence('nodemon'));

// default task: clean dist, compile js files and copy non-js files.
gulp.task('default', ['clean'], () => {
  runSequence(
    ['build:frontend', 'copy', 'babel']
  );
});
