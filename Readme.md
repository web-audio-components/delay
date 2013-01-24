
# Delay

  A simple delay/echo effect module for the Web Audio API.

## Installation

    $ component install web-audio-components/delay

## Example Usage

```javascript
var context = new webkitAudioContext()
  , Delay = require("delay")
  , delay = new Delay(context, 2, 1.0, 0.8)
  , osc = context.createOscillator();

osc.connect(delay.input);
delay.connect(context.destination);
osc.start(0);
```

For further examples, see the test files.

## API

### Delay(context, type, delay, feedback)

Instantiate a Delay effect module. Expects an `AudioContext` as the first
parameter.

**Parameters**

- `type` Delay type; 0: normal, 1: inverted, 2: ping pong.
- `delay` Signal delay time in seconds.
- `feedback` Signal feedback coefficient.

### .connect(node)

Connect a Delay module to an `AudioNode`.

### .disconnect()

Disconnect all outgoing connections from a Delay module.

## License

  Copyright (c) 2012 Nick Thompson

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation
  files (the "Software"), to deal in the Software without
  restriction, including without limitation the rights to use,
  copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following
  conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  OTHER DEALINGS IN THE SOFTWARE.
