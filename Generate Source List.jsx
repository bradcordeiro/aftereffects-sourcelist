﻿// Currently selected Comp in After Effects
var comp = app.project.activeItem;
// Name of the selected Comp in After Effects
var topCompName = comp.name
// The final output string. Starts off as a header row
var output = "Layer,Name,Type,Sequence In,Sequence Out,Sequence Duration,In Composition\n";

// Loop through the layers of the selected Comp and add those layers' info to the output string
scanComp(comp);
// Write the output string to a file
saveCsvFile();

// Recursively step through selected comp and any nested precomps, adding each layer's
// information to the output string
function scanComp(inputComp, timeLineOffset) {
    // Loop through the layers in the Comp
    var layerCount = inputComp.numLayers
   
    timeLineOffset = timeLineOffset === undefined ? 0 : timeLineOffset;
 
    for ( var i = 1; i <= layerCount; i++){
        currentLayer = inputComp.layers[i];
        printSource(currentLayer, i, inputComp.name, timeLineOffset);
        if (currentLayer.source instanceof CompItem){
            // If the current layer is a Comp,  step into it and examine its layers
            scanComp(currentLayer.source, timeLineOffset + currentLayer.inPoint);
        }
    }
}

function printSource(layer, index, parentName, timeLineOffset){
    // will be "footage", "precomp", or "unknown"
    var layerType;
    // timeLineOffset gets added to the layer's timings so that the times
    // reflect the layer's timings in the top-level Comp
    var startSeconds = timeLineOffset + layer.inPoint;
    var endSeconds = timeLineOffset + layer.outPoint;
    var duration = endSeconds - startSeconds;
    
    // Clips played in reverse result in negative durations, but we want
    // a positive timing in our output
    if (duration < 0) { duration *= -1;}
    
    // Append " (top)" to the name of the top comp;
    parentName = parentName === topCompName ? parentName  + " (top)" : parentName;

    // Determine layer type based on layer's source class
    if (layer.source instanceof FootageItem) {
        layerType = "footage";
    } else if (layer.source instanceof CompItem) {
        layerType = "precomp";
    } else {
        layerType = "unknown";
    }

    // Layer number, Source name, Source type, In Timecode, Out Timecode, Duration, Comp Name
    var line = index + "," + layer.source.name + "," + layerType + "," + secondsToTimecode(startSeconds) + "," 
                + secondsToTimecode(endSeconds) + "," + secondsToTimecode(duration) + "," + parentName;
    // Append current line to the final output string
    output += line + "\n";
 }

// Checking times on layers returns seconds, but we want timecodes in the output
// Not frame accurate, but kinda close
function secondsToTimecode(seconds){
    var hours = 0;
    var minutes = 0;
    // seconds are the parameter
    var frames = 0;
   
    if ( seconds > 3600 ) {
        hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        hours = padStart(hours.toString(),2,"0");
    } else {
        hours = "00";
    }

    if ( seconds > 60 ) {
        minutes = Math.floor(seconds / 60);
        seconds %= 60;
        minutes = padStart(minutes.toString(),2,"0");
    } else {
        minutes = "00";
    }

    var subSeconds = seconds - Math.floor(seconds);
    if (subSeconds > 0) {
        frames = Math.floor(subSeconds * comp.frameRate);
        frames = padStart(frames.toString(),2,"0");
    } else {
        frames = "00";
    }

    seconds = Math.floor(seconds);
    seconds = padStart(seconds.toString(),2,"0");

    return hours + ":" + minutes + ":" + seconds + ":" + frames;
}

// Used to make sure each timecode field is 2 digits wide
function padStart(string, padSize, padChar) {
    var length = string.length;
    
    if (length < padSize) {
        while (string.length < padSize){
            string = padChar + string;
        }
    }
    return string;
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
  if (system.osName === "MacOS") {
    dir = "~/Desktop/"
    lineFeed = "Macintosh";
  } else {
    dir = "%UserProfile%" + "\\Desktop\"";
    lineFeed = "Windows";
  }

    // Set file name based on comp being processed, plus date and time
    var now = new Date();
    var dateFormat = now.getMonth() + now.getDate() + now.getFullYear() + "_" + now.getHours() + now.getMinutes() + now.getSeconds();
    var randomname = topCompName + "_" + dateFormat;
    var filepath = dir + randomname + ".csv";

    // get the text file
    var write_file = File(filepath);

    if (!write_file.exists) {
        // if the file does not exist create one
        write_file = new File(filepath);
    } else {
        // if it exists, ask the user if it should be overwritten
        var res = confirm("The file already exists. Should I overwrite it", true, "titleWINonly");
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
        write_file.encoding = "UTF-8";
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
        alert("Source list saved on Desktop as " + randomname + ".csv");
        read_file.close();
    }
}

