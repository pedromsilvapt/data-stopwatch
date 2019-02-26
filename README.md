# data-stopwatch
> Measure the elapsed time in your code between two moments

## Installation
```shell
npm install --save data-stopwatch
```

## Usage
```typescript
const stopwatch = new Stopwatch();

// Code to measure

// Returns a tuple [number, number] that means [seconds, nanoseconds]
stopwatch.pause().read();
// Returns a single number as milliseconds
stopwatch.pause().readMilliseconds();
// Returns a string representing an approximation of the elapsed time readable to humans
stopwatch.pause().readHumanized();

// Any stopwatch can be paused and resumed as many times as needed
stopwatch.resume();

// Also, it might be useful to mark named moments in the stopwatch

stopwatch.mark( 'name1' );

// Also possible to create marks that only count time after a previous mark
stopwatch.mark( 'name2', 'name1' );

// Their times can be read with the same methods as before but with the mark name as argument
stopwatch.readHumanized( 'name2' );
```