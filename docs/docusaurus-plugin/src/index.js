module.exports = function() {
    return {
      name: 'custom-webpack-plugin',
      configureWebpack(_config) {
        return {
          module: {
            rules: [
                {
                    test: /\.mdx?$/,
                    use: [
                        'babel-loader',
                        {
                            loader: '@docusaurus/mdx-loader',
                            options: {
                                // .. See options
                            },
                        },
                    ],
                },
                {
                    test: /\.source$/i,
                    use: 'raw-loader',
                },

            ],
          },
        };
      },
    };
  }