# aftereffects-sourcelist
### ExtendScript for Adobe After Effects to generate a source list for a composition

![Example CSV](https://f001.backblazeb2.com/file/bradcordeiro/aftereffects-sourcelist.png)

### About
I recently ran into a situation where a motion graphics artist was generating animated sequences in After Effects, using a bunch of stock footage as sources. After the graphic was finished and it was time to buy licenses for the the stock footage, we realized it was going to be pretty tedious to not only generate a source list, but step into every precomp, and get those sources too. Not to mention the potential for human error. The compositions were fairly complicated, and exporting them to Adobe Premiere to try and have Premiere produce an EDL was not working for us.

That's how this script was born.

I knew if we could get the information into a spreadsheet, from there we could sort, sift, or otherwise manipulate the information to our heart's content. So that's what this script does. It reads all of the layers in a compostion and writes them to a comma-separated text file that you can open in Microsoft Excel (or OpenOffice, etc.).

It also steps into precomps and finds the sources there. The "parent" composition for each layer is listed, with the top-level comp marked as "(top)". The Sequence timecode in the output is the time at which the clip appears in the top-level composition, not the precomp it's nested within, so the timecodes in this output will match the time of your final render.

### Requirements

None, besides After Effects.

This script was tested on Adobe After Effects CC, on Macintosh. It's meant to work on Windows, but as I have no Windows workstation to test on, I actually have no idea if it will work.

### Installation and Setup

No formal installation is required, though you must change one Preference setting for the script to work. In your General preferences, make sure to check "Allow Scripts to Write Files and Access Network". This will allow the script to write the output text file.

### Usage

1. Download the script and save it somewhere on your computer.
2. Load the composition you'd like to process, and make sure it's the active composition in your work area.
3. Use After Effects' File -> Scripts -> Run Script File... menu entry to open and run the script.
4. The output .csv file will be saved to your Desktop folder. An alert will pop up telling you the output file name.
5. Open the output file in any spreadsheet program that supports comma-separated text (should be all) and enjoy!
