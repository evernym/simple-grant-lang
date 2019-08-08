var assert = require('better-assert');
var fs = require('fs');
var path = require('path');

var sgl = require('./sgl.js');

function loadDir(dir) {
    var obj = {};
    fs.readdirSync(dir).forEach( f => {
        var fullPath = path.join(dir, f);
        var isDir = fs.statSync(fullPath).isDirectory();
        if (isDir) {
            obj[f.slice(0,1)] = loadDir(fullPath);
        } else {
            name = f.slice(f.lastIndexOf('/') + 1, f.length - 5);
            obj[name] = JSON.parse(fs.readFileSync(fullPath));
        }
    });
    return obj;
};

describe('sgl', function() {
    var p, c, r;
    before(function() {
        ex = loadDir("examples");
        p = ex.p;
        c = ex.c;
        r = ex.r;
    });
    describe('satisfies', function() {
        it('reports that bob satisfies id=bob', function() {
            assert(sgl.satisfies(p.bob, c.bob));
            assert(sgl.satisfies(p.bob, r.enter_to_bob));
        });

        it('carl_doesnt_satisfy_id_bob', function() {
            assert(!sgl.satisfies(p.grandpa_carl, c.bob));
        });

        it('bob_matches_1_and_with_id_bob', function() {
            assert(sgl.satisfies([p.bob], c.all_with_1_id));
        });

        it('emily_matches_1_or_with_id_emily', function() {
            assert(sgl.satisfies(p.sister_emily, c.any_with_1_id));
        });

        it('group_with_bob_matches_1_or_with_id_bob', function() {
            assert(sgl.satisfies([p.sister_emily, p.grandma_carol, p.bob], c.any_with_1_id));
        });

        it('grandma_satisfies_grandparent', function() {
            assert(sgl.satisfies(p.grandma_extra, r.three_privs_to_grandparent));
        });

        it('2_grandparents_satisfies_1', function() {
            assert(sgl.satisfies([p.grandma_carol, p.grandpa_carl], r.three_privs_to_grandparent));
        });

        it('1_grandparent_doesnt_satisfy_2', function() {
            assert(!sgl.satisfies([p.grandma_carol], r.spoil_child_to_2_grandparents));
        });

        it('2_grandparents_satisfies_2', function() {
            assert(sgl.satisfies([p.grandma_carol, p.grandpa_carl], r.spoil_child_to_2_grandparents));
        });

        it('multirole_satisfies_1', function() {
            assert(sgl.satisfies(p.employee_and_investor, r.enter_to_employee));
        });
    });
});

