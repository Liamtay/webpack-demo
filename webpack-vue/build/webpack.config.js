const path = require('path');
const webpack = require("webpack");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const vueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.argv.indexOf('--mode=production') === -1;
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

module.exports = {
  entry: {
    main: path.resolve(__dirname, '../src/main.js')
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[name].[hash:8].js',
    chunkFilename: 'js/[name].[hash:8].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          // {
          //   loader: 'babel-loader',
          //   options: {
          //     presets: ['@babel/preset-env']
          //   }
          // },
          {
            loader: 'happypack/loader?id=happyBabel'
          }],
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        use: [{
          loader: 'vue-loader',
          options: {
            compilerOptions: {
              preserveWhitespace: false
            }
          },
        }],
        include: [path.resolve(__dirname, '../src')],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [{
          loader: devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
          options: {
            publicPath: "../dist/css/",
            hmr: devMode
          }
        }, 'css-loader', {
          loader: 'postcss-loader',
          options: {
            plugins: [require('autoprefixer')]
          }
        }]
      },
      {
        test: /\.less$/,
        use: [{
          loader: devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
          options: {
            publicPath: "../dist/css/",
            hmr: devMode
          }
        }, 'css-loader', 'less-loader', {
          loader: 'postcss-loader',
          options: {
            plugins: [require('autoprefixer')]
          }
        }]
      },
      {
        test: /\.(jep?g|png|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10240,
            fallback: {
              loader: 'file-loader',
              options: {
                name: 'img/[name].[hash:8].[ext]'
              }
            },
          },
        },
        include: [path.resolve(__dirname, '../src/assets')],
        exclude: /node_modules/
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10240,
            fallback: {
              loader: 'file-loader',
              options: {
                name: 'media/[name].[hash:8].[ext]'
              }
            }
          }
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10240,
            fallback: {
              loader: 'file-loader',
              options: {
                name: 'media/[name].[hash:8].[ext]'
              }
            }
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.runtime.esm.js',
      ' @': path.resolve(__dirname, '../src'),
      'assets': path.resolve(__dirname, '../src/assets')
    },
    extensions: ['*', '.js', '.json', '.vue']
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html')
    }),
    new vueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css'
    }),
    new HappyPack({
      id: 'happyBabel',
      loaders: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            cacheDirectory: true
          }
        }
      ],
      threadPool: happyThreadPool
    }),
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./vendor-manifest.json')
    }),
    // new CopyWebpackPlugin({ // 拷贝生成的文件到dist目录 这样每次不必手动去cv
    //   patterns: [
    //     { from: 'static', to: 'dist' },
    //   ]
    // }),
  ],
  optimization: {
    minimizer: [
      new ParallelUglifyPlugin({
        cacheDir: '.cache/',
        uglifyJS: {
          output: {
            comments: false,
            beautify: false
          },
          compress: {
            drop_console: true,
            collapse_vars: true,
            reduce_vars: true
          }
        }
      })
    ]
  }
}
