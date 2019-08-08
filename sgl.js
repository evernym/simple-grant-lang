function getMatchingMinimalSubsets() {
    return [];
}

function checkSatisfies(group, c, disjoint) {
    // If the condition calls for us to match by id, do so. Note that we do
    // NOT need to also match by other characteristics; although a principal can
    // have both an id and roles, condition cannot use both at the same time.
    if (c.id) {
        for (var i = 0; i < group.length; ++i) {
            var p = group[i];
            if (p.id == c.id) {
                return true;
            }
        }
    }
    // If we have to match by role, see if our group includes enough that have the
    // required role.
    else if (c.roles) {
        var n = c.n ? c.n : 1;
        for (var i = 0; i < group.length; ++i) {
            var p = group[i];
            // c.roles is a string; p.roles is an array
            if (p.roles && p.roles.indexOf(c.roles) > -1) {
                n -= 1;
                if (n == 0) {
                    return true;
                }
            }
        }
    }
    // If we are looking for a match against any one of several conditions,
    // test each condition individually, and return true if we find the right
    // number of matches.
    else if (c.any) {
        var n = c.n ? c.n : 1;
        for (var i = 0; i < c.any.length; ++i) {
            var condition = c.any[i];
            if (checkSatisfies(group, condition, false)) {
                n -= 1;
                if (n == 0) {
                    return true;
                }
            }
        }
        return false;
    }
    else if (c.all) {
        // If we're doing all (boolean AND) and disjoint subsets, we have to calculate
        // the actual subsets of the group that satisfy subsets of the c,
        // before we can return True or False.
        if (disjoint) {
            disjointSubsets = getMatchingMinimalSubsets(group, c);
            return !!disjointSubsets;
        }

        // This is much easier. Just see if all c are satisfied without checking to
        // see if the subsets of group that satisfies each are disjoint.
        else {
            for (var i = 0; i < c.all.length; ++i) {
                var condition = c.all[i];
                if (!checkSatisfies(group, condition, false)) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}

module.exports = {
    satisfies: function(group, condition, disjoint) {
        if (typeof group == 'object') {
            if (!Array.isArray(group)) {
                group = [group];
            }
        } else {
            throw "group must be obj or array";
        }

        // TODO: eliminate duplicates in group

        if (typeof condition == 'object') {
            // Did we get a rule instead of a condition?
            if (condition.hasOwnProperty('when')) {
                condition = condition.when;
            }
        } else {
            throw "condition must be a rule or the .when of a rule"
        }
        // Now that we've checked all preconditions, call the internal
        // function that does all the work and that is recursive.
        return checkSatisfies(group, condition, disjoint);
    }
}
