/* global app CompItem FootageItem */

// Currently selected Comp in After Effects
const comp = app.project.activeItem;
// Name of the selected Comp in After Effects
const { name: topCompName } = comp;

function getTimecodeHoursFromSeconds(seconds) {
  if (seconds > 3600) {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const remainder = seconds % 3600;
    return { hours, remainder };
  }

  return { hours: '00', remainder: seconds };
}

function getTimecodeMinutesFromSeconds(seconds) {
  if (seconds > 60) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainder = seconds % 60;
    return { minutes, remainder };
  }

  return { minutes: '00', remainder: seconds };
}

function getTimecodeSecondsFromSeconds(seconds) {
  return Math.floor(seconds).toString().padStart(2, '0');
}

function getTimecodeFramesFromSeconds(seconds) {
  const subSeconds = seconds - Math.floor(seconds);
  if (subSeconds > 0) {
    return (Math.floor(subSeconds * comp.frameRate)).toString.padStart(2, '0');
  }

  return '00';
}

// Checking times on layers returns seconds, but we want timecodes in the output
// Not frame accurate, but kinda close
function secondsToTimecode(seconds) {
  const { hours, remainder: hoursRemainder } = getTimecodeHoursFromSeconds(seconds);
  const { minutes, remainder: minutesRemainder } = getTimecodeMinutesFromSeconds(hoursRemainder);
  const newSeconds = getTimecodeSecondsFromSeconds(minutesRemainder);
  const frames = getTimecodeFramesFromSeconds(seconds);

  return `${hours}:${minutes}:${newSeconds}:${frames}`;
}

function generateLine(layer, index, parentName, timeLineOffset) {
  // timeLineOffset gets added to the layer's timings so that the times
  // reflect the layer's timings in the top-level Comp
  const startSeconds = timeLineOffset + layer.inPoint;
  const endSeconds = timeLineOffset + layer.outPoint;
  let duration = endSeconds - startSeconds;

  // Clips played in reverse result in negative durations, but we want
  // a positive timing in our output
  if (duration < 0) duration *= -1;

  // Append " (top)" to the name of the top comp;
  const finalParentName = parentName === topCompName ? `${parentName} (top)` : parentName;

  // Determine layer type based on layer's source class
  let layerType;
  if (layer.source instanceof FootageItem) {
    layerType = 'footage';
  } else if (layer.source instanceof CompItem) {
    layerType = 'precomp';
  } else {
    layerType = 'unknown';
  }

  // Layer number, Source name, Source type, In Timecode, Out Timecode, Duration, Comp Name
  return [
    index,
    layer.source.name,
    layerType,
    secondsToTimecode(startSeconds),
    secondsToTimecode(endSeconds),
    secondsToTimecode(duration),
    finalParentName,
  ];
}

// Recursively step through selected comp and any nested precomps, adding each layer's
// information to the output string
function scanComp(inputComp, timeLineOffset = 0) {
  inputComp.layers.map((layer, index) => { 
    let thisLine = generateLine(layer, index, inputComp.name, timeLineOffset);

    if (layer.source instanceof CompItem) {
      // If the current layer is a Comp,  step into it and examine its layers
      thisLine = thisLine.concat(scanComp(layer.source, timeLineOffset + layer.inPoint));
    }

    return thisLine;
  });
}

function saveCsvFile() {
/*
 *  This function was copied and lightly modified from code by Fabian Morón Zirfas,
 *  which was made public on his GitHub account. Mr. Zirfas' original code can be found
 *  at https://github.com/fabianmoronzirfas/extendscript/wiki/Create-And-Read-Files
 *  and was provided with the following license:
 *
 *  If not further noticed all examples are unlicensed:
 *
 *  This is free and unencumbered software released into the public domain.
 *
 *  Anyone is free to copy, modify, publish, use, compile, sell, or distribute
 *  this software, either in source code form or as a compiled binary, for any purpose,
 *  commercial or non-commercial, and by any means.
 *
 *  In jurisdictions that recognize copyright laws, the author or authors of this
 *  software dedicate any and all copyright interest in the software to the public
 *  domain. We make this dedication for the benefit of the public at large and to the
 *  detriment of our heirs and successors. We intend this dedication to be an overt
 *  act of relinquishment in perpetuity of all present and future rights to this
 *  software under copyright law.

 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 *  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 *  PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR
 *  ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 *  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 *  OTHER DEALINGS IN THE SOFTWARE.
*/

  // Change some settings based on operating system
  // Flying blind on Windows, as I have no test environment
  var dir;
  var lineFeed;
  if (system.osName === 'MacOS') {
    dir = '~/Desktop/'
    lineFeed = 'Macintosh';
  } else {
    dir = '%UserProfile%' + '\\Desktop"';
    lineFeed = 'Windows';
  }

    // Set file name based on comp being processed, plus date and time
    var now = new Date();
    var dateFormat = now.getMonth() + now.getDate() + now.getFullYear() + '_' + now.getHours() + now.getMinutes() + now.getSeconds();
    var randomname = topCompName + '_' + dateFormat;
    var filepath = dir + randomname + '.csv';

    // get the text file
    var write_file = File(filepath);

    if (!write_file.exists) {
        // if the file does not exist create one
        write_file = new File(filepath);
    } else {
        // if it exists, ask the user if it should be overwritten
        var res = confirm('The file already exists. Should I overwrite it', true, 'titleWINonly');
        // if the user hits no stop the script
        if (res !== true) {
            return;
        }
    }

    var out; // our output
    // we know already that the file exist
    // but to be sure
    if (write_file !== '') {
        //Open the file for writing.
        out = write_file.open('w', undefined, undefined);
        write_file.encoding = 'UTF-8';
        write_file.lineFeed = lineFeed;
    }
    // got an output?
    if (out !== false) {
        // write the output string to the file
        write_file.write(output);
        // always close files!
        write_file.close();
    }

    // check to make sure the output file was written
    var read_file = File(filepath);
    read_file.open('r', undefined, undefined);
    if (read_file !== '') {
        alert('Source list saved on Desktop as ' + randomname + '.csv');
        read_file.close();
    }
}

// The final output string. Starts off as a header row
var output = [
  'Layer',
  'Name',
  'Type',
  'Sequence In',
  'Sequence Out',
  'Sequence Duration',
  'In Composition'
];

// Loop through the layers of the selected Comp and add those layers' info to the output string
scanComp(comp);
// Write the output string to a file
saveCsvFile();