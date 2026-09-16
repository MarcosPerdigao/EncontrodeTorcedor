'use strict';

// No JSON is parsed. Import/deploy pipelines using this optional CLI capability
// are outside the authorized foundation and must fail before processing input.
function disabled() {
  throw new Error('JSON import pipelines are disabled in this emulator-only foundation.');
}

module.exports = Object.assign(disabled, {
  parser: disabled,
  pick: disabled,
  filter: disabled,
  streamArray: disabled,
  streamObject: disabled,
  withParser: disabled,
  make: disabled,
});
