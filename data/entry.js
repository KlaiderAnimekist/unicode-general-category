const path = require('path')
    , fs   = require('fs')

const {GeneralCategory} = require('./src/category')
    , {Scanner, Row}    = require('./src/scanner')

const BMP_CHECKPOINTS = [
    0x100,
    0x376,
    0x800,
    0x1000,
    0x2016,
    0x3000,
    0x4E00,
    0xA000,
    0xAC00,
    0xF900,
    0,        // Null
]

function bmpToBin() {
    const out = Buffer.allocUnsafe(20000)
    let i = 0
    let curCp = 0

    const checks = []
    let checkIndex = 0
      , checkCode = BMP_CHECKPOINTS[0]

    const scanner = new Scanner(fs.readFileSync(path.join(__dirname, 'input-bmp.txt'), 'binary'))
    const {entry: row} = scanner
        , prev = new Row
    scanner.next()

    for (;;) {
        // Add to `bmp-checkpoints.txt`
        if (row.codePoint === checkCode) {
            checks.push(i)
            checkCode = BMP_CHECKPOINTS[++checkIndex]
        }

        // Detect hole
        if (row.kind != Row.NONE && curCp != row.codePoint) {
            out.writeUInt8(GeneralCategory.NOT_ASSIGNED_OTHER, i++)
            out.writeUInt16LE(row.codePoint - curCp, i)
            curCp = row.codePoint
            i += 2
        }

        if (row.kind === Row.SOLE) {
            // If congruent with next, that's an interval.
            const cat = row.category
            const ii = row.codePoint
            let ij = ii

            for (;;) {
                row.copy(prev)
                scanner.next()
                if (areCongruent(cat, prev, row)) ++ij
                else break
            }

            out.writeUInt8(cat, i++)
            out.writeUInt16LE(ij - ii + 1, i)
            curCp = ij + 1
            i += 2
        } else if (row.kind === Row.BEGINS_RANGE) {
            row.copy(prev)
            scanner.next()
            out.writeUInt8(prev.category, i++)
            out.writeUInt16LE(row.codePoint - prev.codePoint + 1, i)
            curCp = row.codePoint + 1
            i += 2
            scanner.next()
        } else break
    }

    fs.writeFileSync(path.join(__dirname, 'output/bmp.bin'), out.slice(0, i))

    // bmp-checkpoints.txt

    const readableChecks = []
    let j = 0

    for (let addr of checks)
        readableChecks.push(`U+${BMP_CHECKPOINTS[j++].toString(16).toUpperCase()} = addr ${addr}`)

    fs.writeFileSync(path.join(__dirname, 'output/bmp-checkpoints.txt'), readableChecks.join('\n'))
}

function smpToBin() {
    const out = Buffer.alloc(20000)
    let i = 0
    let curCp = 0x10000

    const scanner = new Scanner(fs.readFileSync(path.join(__dirname, 'input-smp.txt'), 'binary'))
    const {entry: row} = scanner
        , prev = new Row
    scanner.next()

    for (;;) {
        // Detect hole
        if (row.kind != Row.NONE && curCp != row.codePoint) {
            out.writeUInt8(GeneralCategory.NOT_ASSIGNED_OTHER, i++)
            writeUInt24LE(out, row.codePoint - curCp, i)
            curCp = row.codePoint
            i += 3
        }

        if (row.kind === Row.SOLE) {
            // If congruent with next, that's an interval.

            const cat = row.category
            const ii = row.codePoint
            let ij = ii

            for (;;) {
                row.copy(prev)
                scanner.next()
                if (areCongruent(cat, prev, row)) ++ij
                else break
            }

            out.writeUInt8(cat, i++)
            writeUInt24LE(out, ij - ii + 1, i)
            curCp = ij + 1
            i += 3
        } else if (row.kind === Row.BEGINS_RANGE) {
            row.copy(prev)
            scanner.next()
            out.writeUInt8(prev.category, i++)
            writeUInt24LE(out, row.codePoint - prev.codePoint + 1, i)
            curCp = row.codePoint + 1
            i += 3
            scanner.next()
        } else break
    }

    fs.writeFileSync(path.join(__dirname, 'output/smp.bin'), out.slice(0, i))
}

function writeUInt24LE(buf, value, index) {
    buf.writeUInt16LE(value & 0xFFFF, index)
    buf.writeUInt8(value >> 16, index + 2)
}

function areCongruent(cat, prev, row) {
    return row.kind      === Row.SOLE
        && row.category  === cat
        && row.codePoint === prev.codePoint + 1
}

bmpToBin()
smpToBin()