let registry = new FinalizationRegistry(heldValue => {
  console.log('Object was garbage collected with held value:', heldValue);
  // Perform cleanup operations here, using the heldValue.
});

let obj = { data: 'some data' };
let heldValue = 'some unique identifier';

registry.register(obj, heldValue, obj); //register the object with the registry.

// Remove the strong reference to the object.
obj = null;

// The garbage collector may now reclaim the object.
// To simulate, you can try to trigger GC, but it's not reliable.

if (typeof global !== 'undefined' && global.gc) { //NodeJS
    console.log("here1");
	global.gc();
} else if (typeof window !== 'undefined' && window.gc){ //Browsers
    window.gc();
}

console.log("here "+global.gc);

// The callback in the FinalizationRegistry will be called
// *eventually* after the object is garbage-collected.
// The timing is not deterministic.
function myFunction() {
  console.log("Function called at:", new Date().toLocaleTimeString());
}

const intervalMilliseconds = 2000; // Call every 2 seconds

const intervalId = setInterval(myFunction, intervalMilliseconds);

// To stop the interval after a certain time (e.g., 10 seconds):
setTimeout(() => {
  clearInterval(intervalId);
  console.log("Interval stopped.");
}, 10000); // 10 seconds
