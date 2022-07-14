# UnicodeData.txt shrinker

This tool shrinks `UnicodeData.txt` (`input-xxx.txt` here) into a binary.

IN:
* `input-bmp.txt`: contains all Basic Multilingual Plane rows followed by a _last_ new line.
* `input-smp.txt`: contains all Supplementary Plane rows also followed by a _last_ new line.

OUT:
* `output/bmp-checkpoints.txt`; skip points for `out-bmp.bin`.
* `output/bmp.bin`; sequence containing intervals; it follows the format `uint8 uint16` little-endian, that is, `<Gc> numberOfCodePoints`.
* `output/smp.bin`; supplementary-plane version of `out-smp.bin`; uses the format `uint8 uint24` little-endian.

It doesn't download/update `UnicodeData.txt` automatically. Find it [here](http://unicode.org/Public/).