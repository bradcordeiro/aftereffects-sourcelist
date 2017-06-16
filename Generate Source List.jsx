var comp = app.project.activeItem;
var topCompName = comp.name;
var output = "";

output += "Layer,Name,Type,Sequence In,Sequence Out,Sequence Duration,In Composition\n";
scanComp(comp);
saveCsvFile();


function scanComp(inputComp, timeLineOffset) {
    var layerCount = inputComp.numLayers;
    if (timeLineOffset === undefined) {
        timeLineOffset = 0;
    }
    
    for ( var i = 1; i <= layerCount; i++){
        currentLayer = inputComp.layers[i];
       
        if (currentLayer.source instanceof CompItem){
            printSource (currentLayer, i, currentLayer.containingComp.name, timeLineOffset);
            scanComp(currentLayer.source, timeLineOffset + currentLayer.inPoint);
        } else {
            printSource(currentLayer, i, currentLayer.name, timeLineOffset);
        }
    }
}

function printSource(layer, index, parentName, timeLineOffset){
    var layerType;
    var startSeconds = timeLineOffset + layer.inPoint;
    var endSeconds = timeLineOffset + layer.outPoint;
    var duration = endSeconds - startSeconds;
    
    if (duration < 0) { duration *= -1;}
    
    if (parentName === topCompName) {
        parentName += " (top)";
    }

    if (layer.source instanceof FootageItem) {
        layerType = "footage";
    } else if (layer.source instanceof CompItem) {
        layerType = "precomp";
    } else {
        layerType = "unknown";
    }
        
    var line = index + "," + layer.source.name + "," + layerType + "," + secondsToTimecode(startSeconds) + "," 
                + secondsToTimecode(endSeconds) + "," + secondsToTimecode(duration) + "," + parentName;
    output += line + "\n";
 }

function secondsToTimecode(seconds){
    var hours = 0;
    var minutes = 0;
    seconds = Math.floor(seconds);
    var frames = "00";
   
    
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
        seconds = padStart(seconds.toString(),2,"0");
    } else {
        minutes = "00";
    }

    return hours + ":" + minutes + ":" + seconds + ":" + frames;
}

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
