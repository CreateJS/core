# Contributing

We welcome pull requests on fixes, documentation updates, and even features. Ideally changes are discrete, documented inline with current standards, and don't contain superficial changes like tab formatting an entire file (hard to accept a PR that has 1000 changes). Don't commit updates to the `dist/` folder, as those will be done by the maintainers at our discretion.

The classes in this repository are used by many of the classes in the CreateJS suite. Ensure that changes are thoroughly tested, and any changes required in the other repositories are committed, referencing the original pull request in this repository.

### Pull Requests

Our continuous integration processes will lint and test all pull requests. To save time, please lint and test your changes locally, prior to committing.

Please reference any issues that your PR addresses.

### Local Development

```
# clone repo
git clone https://github.com:createjs/core.git
cd path/to/core
# install dependencies and create a symlink
npm install
npm link .
# link core to another lib for testing
cd path/to/easeljs
npm link @createjs/core
```

Documentation for compiling and testing the source can be found in the [build repository README](https://github.com/createjs/build/blob/master/README.md).

Remember to unlink dependencies when local testing is completed.
