// 生成打包配置
import cliProgress from "cli-progress";
import figlet from "figlet";
import ora from "ora";
import path from "path";
import { createRequire } from "module";
import { terser } from "rollup-plugin-terser";
import visualizer from "rollup-plugin-visualizer";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import delFile from "rollup-plugin-delete";

const require = createRequire(import.meta.url);
const packageInfo = require("./package.json");
let hasPrintedProjectBanner = false;

const color = {
  cyan: value => `\x1b[36m${value}\x1b[0m`,
  green: value => `\x1b[32m${value}\x1b[0m`,
  red: value => `\x1b[1;31m${value}\x1b[0m`,
  gray: value => `\x1b[90m${value}\x1b[0m`
};

const isEnabled = value => value === true || value === "true";

const formatDuration = startTime => {
  const elapsed = Date.now() - startTime;
  if (elapsed < 1000) {
    return `${elapsed}ms`;
  }
  return `${(elapsed / 1000).toFixed(1)}s`;
};

const normalizeModulePath = id => {
  if (!id || id.includes("\0")) {
    return "internal module";
  }
  return path
    .relative(process.cwd(), id.split("?")[0])
    .split(path.sep)
    .join("/");
};

const truncateText = (value, maxLength = 56) => {
  if (value.length <= maxLength) {
    return value;
  }
  return `...${value.slice(value.length - maxLength + 3)}`;
};

const printProjectBanner = buildName => {
  if (hasPrintedProjectBanner || process.env.CI || process.env.BUILD_BANNER === "false") {
    return;
  }
  hasPrintedProjectBanner = true;

  const title = figlet.textSync("JS ScreenShot", {
    font: "Big",
    horizontalLayout: "full",
    verticalLayout: "default"
  }).trimEnd();
  const banner = title
    .split("\n")
    .map(line => color.red(line))
    .join("\n");
  const meta = `${packageInfo.name} v${packageInfo.version} | ${buildName}`;

  process.stderr.write(`\n${banner}\n${color.gray(meta)}\n\n`);
};

// 处理output对象中的format字段(传入的参数会与rollup所定义的参数不符，因此需要在这里进行转换)
const buildFormat = formatVal => {
  let finalFormatVal = formatVal;
  switch (formatVal) {
    case "esm":
      finalFormatVal = "es";
      break;
    case "common":
      finalFormatVal = "cjs";
      break;
    default:
      break;
  }
  return finalFormatVal;
};

/**
 * 根据外部条件判断是否需要给对象添加属性
 * @param obj 对象名
 * @param condition 条件
 * @param propName 属性名
 * @param propValue 属性值
 */
const addProperty = (obj, condition, propName, propValue) => {
  // 条件成立则添加
  if (condition) {
    obj[propName] = propValue;
  }
};

const buildConfig = (packagingFormat = [], compressedState = "false") => {
  const outputConfig = [];
  for (let i = 0; i < packagingFormat.length; i++) {
    const pkgFormat = packagingFormat[i];
    // 根据packagingFormat字段来构建对应格式的包
    const config = {
      file: `dist/screenShotPlugin.${pkgFormat}.js`,
      format: buildFormat(pkgFormat),
      name: "screenShotPlugin"
    };
    // 是否需要对代码进行压缩
    addProperty(config, compressedState === "true", "plugins", [
      terser({
        output: {
          comments: false // 删除注释
        }
      })
    ]);
    addProperty(config, pkgFormat === "common", "exports", "named");
    outputConfig.push(config);
  }
  return outputConfig;
};

const buildCopyTargetsConfig = (useDevServer = "false") => {
  const result = [
    {
      src: "src/assets/fonts/**",
      dest: "dist/assets/fonts"
    }
  ];
  if (useDevServer === "true") {
    result.push({
      src: "public/**",
      dest: "dist"
    });
  }
  return result;
};

// 生成打包后的模块占用信息
const enablePKGStats = (status = "false") => {
  if (status === "true") {
    return visualizer({
      filename: "dist/bundle-stats.html"
    });
  }
  return null;
};

const buildProgressPlugin = ({
  useDevServer = "false",
  outputCount = 1,
  compressedState = "false"
} = {}) => {
  const isWatchMode = isEnabled(useDevServer);
  const totalOutputs = Math.max(Number(outputCount) || 1, 1);
  const buildName = isWatchMode
    ? "dev build"
    : isEnabled(compressedState)
      ? "production build"
      : "build";

  let progressBar = null;
  let spinner = null;
  let startTime = 0;
  let currentProgress = 0;
  let transformedModules = 0;
  let writtenOutputs = 0;
  let failed = false;

  const stopProgress = () => {
    if (progressBar) {
      progressBar.stop();
      progressBar = null;
    }
    if (spinner) {
      spinner.stop();
      spinner = null;
    }
  };

  const updateProgress = (value, stage) => {
    if (failed) {
      return;
    }
    currentProgress = Math.max(currentProgress, Math.min(Math.floor(value), 99));
    const stageText = truncateText(stage);
    if (spinner) {
      spinner.text = `${buildName} - ${stageText}`;
      return;
    }
    if (progressBar) {
      progressBar.update(currentProgress, {
        stage: stageText
      });
    }
  };

  const failProgress = () => {
    if (failed) {
      return;
    }
    failed = true;
    const duration = formatDuration(startTime);
    if (spinner) {
      spinner.stopAndPersist({
        symbol: color.red("[fail]"),
        text: `${buildName} failed after ${duration}`
      });
      spinner = null;
      return;
    }
    if (progressBar) {
      progressBar.stop();
      progressBar = null;
      process.stderr.write(`${color.red("build failed")} ${color.gray(duration)}\n`);
    }
  };

  const completeProgress = () => {
    if (failed) {
      return;
    }
    const duration = formatDuration(startTime);
    if (spinner) {
      spinner.stopAndPersist({
        symbol: color.green("[ok]"),
        text: `${buildName} ready in ${duration}`
      });
      spinner = null;
      return;
    }
    if (progressBar) {
      progressBar.update(100, {
        stage: `done in ${duration}`
      });
      progressBar.stop();
      progressBar = null;
      process.stderr.write(`${color.green("build complete")} ${color.gray(duration)}\n`);
    }
  };

  return {
    name: "screen-shot-build-progress",
    buildStart() {
      startTime = Date.now();
      currentProgress = 0;
      transformedModules = 0;
      writtenOutputs = 0;
      failed = false;
      stopProgress();
      printProjectBanner(buildName);

      if (isWatchMode) {
        spinner = ora({
          text: `${buildName} - starting`,
          spinner: "line",
          color: "cyan"
        }).start();
        return;
      }

      progressBar = new cliProgress.SingleBar({
        format: `${color.cyan("rollup")} |{bar}| {percentage}% | {stage}`,
        barsize: 34,
        barCompleteChar: "=",
        barIncompleteChar: "-",
        hideCursor: true,
        clearOnComplete: false,
        stopOnComplete: false,
        noTTYOutput: !process.env.CI,
        notTTYSchedule: 1000,
        autopadding: true
      });
      progressBar.start(100, 3, {
        stage: "starting"
      });
      currentProgress = 3;
    },
    resolveId() {
      updateProgress(8, "resolving imports");
      return null;
    },
    load() {
      updateProgress(12, "loading modules");
      return null;
    },
    transform(code, id) {
      transformedModules += 1;
      updateProgress(
        Math.min(76, 16 + transformedModules * 0.45),
        `${transformedModules} modules - ${normalizeModulePath(id)}`
      );
      return null;
    },
    buildEnd(error) {
      if (error) {
        failProgress();
        return;
      }
      updateProgress(78, `${transformedModules} modules ready`);
    },
    renderStart(outputOptions) {
      updateProgress(82, `render ${outputOptions.format || "bundle"}`);
    },
    generateBundle(outputOptions, bundle) {
      if (isWatchMode && spinner) {
        spinner.stopAndPersist({
          symbol: color.cyan("[build]"),
          text: `${buildName} generated ${Object.keys(bundle).length} assets`
        });
        spinner = null;
        return;
      }
      updateProgress(90, `generate ${Object.keys(bundle).length} assets`);
    },
    writeBundle(outputOptions) {
      writtenOutputs += 1;
      const outputName = outputOptions.file
        ? path.basename(outputOptions.file)
        : outputOptions.dir || "dist";
      if (isWatchMode && spinner) {
        spinner.stopAndPersist({
          symbol: color.cyan("[build]"),
          text: `${buildName} wrote ${outputName}`
        });
        spinner = null;
        return;
      }
      updateProgress(92 + Math.min((writtenOutputs / totalOutputs) * 6, 6), `write ${outputName}`);
    },
    renderError() {
      failProgress();
    },
    closeBundle() {
      if (isWatchMode && !spinner) {
        process.stderr.write(`${color.green("[ok]")} ${buildName} ready in ${formatDuration(startTime)}\n`);
        return;
      }
      completeProgress();
    }
  };
};

const enableDevServer = status => {
  // 默认清空dist目录下的文件
  let serverConfig = [delFile({ targets: "dist/*" })];
  if (status === "true") {
    // dev模式下不需要对dist目录进行清空
    serverConfig = [
      serve({
        // 服务器启动的文件夹,访问此路径下的index.html文件
        contentBase: "dist",
        port: 8123
      }),
      // watch dist目录，当目录中的文件发生变化时，刷新页面
      livereload("dist")
    ];
  }
  return serverConfig;
};

const buildTSConfig = (useDevServer = "false") => {
  return {
    tsconfig: "tsconfig.json",
    tsconfigOverride: {
      compilerOptions: {
        // dev模式下不生成.d.ts文件
        declaration: useDevServer !== "true",
        // 指定目标环境为es5
        target: "es5"
      },
      // 打包时排除tests目录
      exclude: ["tests"]
    },
    clean: true
  };
};

export {
  buildConfig,
  buildCopyTargetsConfig,
  enablePKGStats,
  enableDevServer,
  buildTSConfig,
  buildProgressPlugin
};
