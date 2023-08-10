Recreation of a graphql error when stitching two graphql servers together.
Error: Cannot return null for non-nullable field X.name.

Setup:
------

1. Install [nodenv](https://github.com/nodenv/nodenv).

   For macOS, you can install nodenv using Homebrew:

   ```bash
   brew install nodenv
   ```
   
   Also set up nodenv in your shell, add the below to your shell's rc/profile file:
   
   ```bash
   eval "$(nodenv init -)"

2. In this directory, run:

   ```bash
   nodenv install --skip-existing
   ```

   Use `--skip-existing`, or simply `-s` so that nodenv does not prompt you 
   whether the specific version of Node should be reinstalled, if it is 
   currently installed.

3. Install packages:

   ```bash
   npm install
   ```

To run:
-------

1. In one terminal window run:

   ```bash
   npm run externalStart
   ```

2. In another terminal window run:

   ```bash
   npm run localStart
   ```

3. Access the server from http://localhost:4000/
