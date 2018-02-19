const gulp = require("gulp");
const sourcemaps = require('gulp-sourcemaps');
const webpack = require("webpack-stream");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const tsBabelConfig = {
    declaration: true,
    noImplicitAny: true,
    sourceMap: true,
    target: "es2015",
    lib: ["es5", "dom"],
};
const babel = require("gulp-babel");

gulp.task("typescript-definitions", function () {
    const tsProject = ts.createProject("tsconfig.json");
    return gulp.src("src/**/*.ts")
        .pipe(tsProject(tsBabelConfig)).dts
        .pipe(gulp.dest("build"));
});

gulp.task("typescript-babel", ["typescript-definitions"], function () {
    const tsProject = ts.createProject("tsconfig.json");
    return gulp.src("src/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(tsProject(tsBabelConfig)).js
        .pipe(babel())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("build"));
});

gulp.task("default", ["typescript-babel"]);