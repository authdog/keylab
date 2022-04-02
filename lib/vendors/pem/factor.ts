var asn = require("asn1.js");
var crypto = require("crypto");
var BN = asn.bignum;

var zero = new BN(0);
var one = new BN(1);
var two = new BN(2);

// rand returns a random number in the range (low, high)
function rand(low, high) {
    do {
        var b = new BN(crypto.randomBytes(high.byteLength()));
    } while (b.cmp(low) <= 0 || b.cmp(high) >= 0);
    return b;
}

function odd(n) {
    if (n.cmp(zero) === 0) {
        return zero;
    }
    var r = n;
    while (r.isEven()) {
        r = r.div(two);
    }
    return r;
}

function rootOne(x, r, n) {
    var i = x.toRed(BN.red(n)).redPow(r).fromRed();
    var o = zero;
    while (i.cmp(one) !== 0) {
        o = i;
        i = i.mul(i).mod(n);
    }
    if (o.cmp(n.sub(one)) === 0) {
        return zero;
    }
    return o;
}

export const factor = (e: any, d: number, n: any) => {
    var k = e.mul(d).sub(one);
    var r = odd(k);
    do {
        var y = rootOne(rand(two, n), r, n);
    } while (y.cmp(zero) === 0);

    var p = y.sub(one).gcd(n);
    return {
        p,
        q: n.div(p)
    };
};
