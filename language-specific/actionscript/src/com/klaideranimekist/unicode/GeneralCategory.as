package com.klaideranimekist.unicode {
    import flash.utils.ByteArray;
    import flash.utils.Dictionary;
    import flash.utils.Endian;

    public final class GeneralCategory {
        [Embed(
            source = '../../../../../../data/output/bmp.bin',
            mimeType = 'application/octet-stream'
        )]
        static private const bmpPlaneClass:Class;
        static private const bmpPlane:ByteArray = new bmpPlaneClass as ByteArray;
        bmpPlane.endian = Endian.LITTLE_ENDIAN;

        [Embed(
            source = '../../../../../../data/output/smp.bin',
            mimeType = 'application/octet-stream'
        )]
        static private const smpPlaneClass:Class;
        static private const smpPlane:ByteArray = new smpPlaneClass as ByteArray;
        smpPlane.endian = Endian.LITTLE_ENDIAN;

        [Embed(
            source = '../../../../../../data/output/bmp-checkpoints.txt',
            mimeType = 'application/octet-stream'
        )]
        static private const bmpCheckpointsTextClass:Class;
        static private const bmpCheckpointsText:String = ByteArray(new bmpCheckpointsTextClass).toString();
        static private const bmpCheckpoints:Vector.<uint> = new Vector.<uint>;
        bmpCheckpoints.push(0, 0);
        initBmpCheckpoints();

        private var _value:uint;
        static private var _categories:Dictionary = new Dictionary;

        static public const CONTROL_OTHER:GeneralCategory = new GeneralCategory(0x00); // Cc
        static public const FORMAT_OTHER:GeneralCategory = new GeneralCategory(0x01); // Cf
        static public const PRIVATE_USE_OTHER:GeneralCategory = new GeneralCategory(0x02); // Co
        static public const SURROGATE_OTHER:GeneralCategory = new GeneralCategory(0x03); // Cs
        static public const NOT_ASSIGNED_OTHER:GeneralCategory = new GeneralCategory(0x04); // Cn

        static public const LOWERCASE_LETTER:GeneralCategory = new GeneralCategory(0x10);     // Ll
        static public const MODIFIER_LETTER:GeneralCategory = new GeneralCategory(0x10 + 1); // Lm
        static public const OTHER_LETTER:GeneralCategory = new GeneralCategory(0x10 + 2); // Lo
        static public const TITLECASE_LETTER:GeneralCategory = new GeneralCategory(0x10 + 3); // Lt
        static public const UPPERCASE_LETTER:GeneralCategory = new GeneralCategory(0x10 + 4);  // Lu

        static public const COMBINING_SPACING_MARK:GeneralCategory = new GeneralCategory(0x20); // Mc
        static public const ENCLOSING_MARK:GeneralCategory = new GeneralCategory(0x20 + 1); // Me
        static public const NON_SPACING_MARK:GeneralCategory = new GeneralCategory(0x20 + 2); // Mn

        static public const DECIMAL_NUMBER:GeneralCategory = new GeneralCategory(0x40); // Nd
        static public const LETTER_NUMBER:GeneralCategory = new GeneralCategory(0x40 + 1); // Nl
        static public const OTHER_NUMBER:GeneralCategory = new GeneralCategory(0x40 + 2); // No
        static public const CONNECTOR_PUNCTUATION:GeneralCategory = new GeneralCategory(0x40 + 3); // Pc
        static public const DASH_PUNCTUATION:GeneralCategory = new GeneralCategory(0x40 + 4); // Pd
        static public const OPEN_PUNCTUATION:GeneralCategory = new GeneralCategory(0x40 + 5); // Ps
        static public const CLOSE_PUNCTUATION:GeneralCategory = new GeneralCategory(0x40 + 6); // Pe
        static public const INITIAL_QUOTE_PUNCTUATION:GeneralCategory = new GeneralCategory(0x40 + 7); // Pi
        static public const FINAL_QUOTE_PUNCTUATION:GeneralCategory = new GeneralCategory(0x40 + 8); // Pf
        static public const OTHER_PUNCTUATION:GeneralCategory = new GeneralCategory(0x40 + 9); // Po
        static public const CURRENCY_SYMBOL:GeneralCategory = new GeneralCategory(0x40 + 10); // Sc
        static public const MODIFIER_SYMBOL:GeneralCategory = new GeneralCategory(0x40 + 11); // Sk
        static public const MATH_SYMBOL:GeneralCategory = new GeneralCategory(0x40 + 12); // Sm
        static public const OTHER_SYMBOL:GeneralCategory = new GeneralCategory(0x40 + 13); // So
        static public const LINE_SEPARATOR:GeneralCategory = new GeneralCategory(0x40 + 14); // Zl
        static public const PARAGRAPH_SEPARATOR:GeneralCategory = new GeneralCategory(0x40 + 15); // Zp
        static public const SPACE_SEPARATOR:GeneralCategory = new GeneralCategory(0x40 + 16); // Zs

        static public function from(ch:uint):GeneralCategory {
            var cp:uint = ch;
            if (cp >> 16 !== 0)
                return smpPlaneAgainst(cp);
            else {
                var l:uint = bmpCheckpoints.length - 2;
                for (var i:uint = 0; i < l; i += 2)
                    if (cp >= bmpCheckpoints[i] && cp < bmpCheckpoints[i + 2])
                        return bmpPlaneAgainst(cp, bmpCheckpoints[i + 1], bmpCheckpoints[i]);
                return bmpPlaneAgainst(cp, bmpCheckpoints[bmpCheckpoints.length - 1], bmpCheckpoints[bmpCheckpoints.length - 2]);
            }
        }

        static private function initBmpCheckpoints():void {
            for each (var s:String in bmpCheckpointsText.split('\n')) {
                var cp:uint = parseInt(s.match(/U\+([0-9a-f]+)/i)[1], 16);
                var i:uint = parseInt(s.match(/addr ([0-9]+)/)[1]);
                bmpCheckpoints.push(cp, i);
            }
        }

        public function GeneralCategory(value:uint)
        {
            this._value = value;
            _categories[value] = this;
        }

        public function valueOf():uint
        {
            return this._value;
        }

        public function get isOther():Boolean
        {
            return !(this.valueOf() >> 4)
        }

        public function isLetter():Boolean
        {
            return this.valueOf() >> 4 === 1
        }

        public function isMark():Boolean
        {
            return this.valueOf() >> 5 === 1
        }

        public function isNumber():Boolean
        {
            return this.valueOf() >> 6 === 1 && this.valueOf() < CONNECTOR_PUNCTUATION.valueOf();
        }

        public function isPunctuation():Boolean
        {
            return this.valueOf() >> 6 === 1 && this.valueOf() > OTHER_NUMBER.valueOf() && this.valueOf() < CURRENCY_SYMBOL.valueOf();
        }

        public function isSymbol():Boolean
        {
            return this.valueOf() >> 6 === 1 && this.valueOf() > OTHER_PUNCTUATION.valueOf() && this.valueOf() < LINE_SEPARATOR.valueOf();
        }

        public function isSeparator():Boolean
        {
            return this.valueOf() >> 6 === 1 && this.valueOf() > OTHER_SYMBOL.valueOf();
        }

        static private function bmpPlaneAgainst(cp:uint, start:uint, startCp:uint):GeneralCategory
        {
            bmpPlane.position = start
            var cat:uint, cp2:uint = startCp
            while (bmpPlane.position !== bmpPlane.length)
            {
                cat = bmpPlane.readUnsignedByte()
                cp2 += bmpPlane.readUnsignedShort()
                if (cp < cp2) return _categories[cat];
            }
            return NOT_ASSIGNED_OTHER
        }

        static private function smpPlaneAgainst(cp:uint):GeneralCategory {
            smpPlane.position = 0
            var cat:uint, cp2:uint = 0x10000
            while (smpPlane.position !== smpPlane.length)
            {
                cat = smpPlane.readUnsignedByte()
                cp2 += readUint24(smpPlane)
                if (cp < cp2) return _categories[cat];
            }
            return NOT_ASSIGNED_OTHER
        }

        static private function readUint24(ba:ByteArray):uint {
            return ba.readUnsignedShort()
                 | (ba.readUnsignedByte() << 16)
        }
    }
}