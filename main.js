var svgNS = "http://www.w3.org/2000/svg";
const zip = (a, b) => a.map((k, i) => [k, b[i]]);
var params = {
    line_length: 600,
    line_spacing: 10,
    init_x: 30,
    init_y: 40,
    neck_height: 10,
    body_width: 10,
    body_height: 30,
    nose_height: 20,
    head_size: 10,
    foot_gap: 10,
    legs_height: 20,
    arm_length: 30,
    flag_length: 8,
    flag_contour_width: 1,
    horizontal_spacing: 60
};

const default_params = {
    line_length: 600,
    line_spacing: 10,
    init_x: 30,
    init_y: 40,
    neck_height: 10,
    body_width: 10,
    body_height: 30,
    nose_height: 20,
    head_size: 10,
    foot_gap: 10,
    legs_height: 20,
    arm_length: 30,
    flag_length: 8,
    flag_contour_width: 1,
    horizontal_spacing: 60
};

alphabet_right_positions = [1, 2, 3, 4, 0, 0, 0, 1, 1,
                            4, 1, 1, 1, 1, 2, 2, 2, 2,
                            2, 3, 3, 4, 5, 5, 3, 6];
alphabet_left_positions =  [0, 0, 0, 0, 5, 6, 7, 2, 3,
                            6, 4, 5, 6, 7, 3, 4, 5, 6,
                            7, 4, 5, 7, 6, 7, 6, 7];

f = 0.7071067811865475;
arm_pos_xx =  [-f, -1, -f,  0,  f,  1, f];
arm_pos_yy =  [ f,  0, -f, -1, -f,  0, f];
flag_pos_xx = [-f, -1, -f,  0, -f, -1, -f];
flag_pos_yy = [ f,  0, -f, -1,  f,  0, -f];

function translate() {
    var cur_x = params.init_x;
    var cur_y = params.init_y;

    var text = document.getElementById("to-translate").value.trim().toLowerCase();
    var svg = document.getElementById("svg-output");
    svg.innerHTML = "";

    const stickman_height = params.arm_length + params.body_height + params.legs_height;
    const letters_per_line = params.line_length * 1.0 / params.horizontal_spacing;
    svg.setAttribute("height", Math.ceil(text.length / letters_per_line) * (params.line_spacing + stickman_height));
    svg.setAttribute("width", 2 * cur_x + text.length * params.horizontal_spacing);

    for (var i = 0; i < text.length; i++) {
        c = text.charAt(i);
        if ((/[a-z]/).test(c)) {
            var stickman = createStickman(cur_x, cur_y, c, params);
            cur_x += params.horizontal_spacing;
            svg.appendChild(stickman);
        } else if ((/[ \t\n]/).test(c)) {
            cur_x += params.horizontal_spacing;
        }

        if (cur_x > params.line_length) {
            cur_x = params.init_x;
            cur_y += params.line_spacing + stickman_height;
        }
    }

}

function createStickman(x, y, c, params) {
    var group = createStickmanBase(x, y, params);

    var n = c.charCodeAt(0) - 'a'.charCodeAt(0);
    left = alphabet_left_positions[n];
    right = alphabet_right_positions[n];
    if (left !== 0) {
        var larm = createStickmanArm(x, y, "left", left - 1, params);
        group.appendChild(larm);
    }
    if (right !== 0) {
        var rarm = createStickmanArm(x, y, "right", right - 1, params);
        group.appendChild(rarm);
    }


    return group;
}

function createStickmanArm(x, y, side, pos, params) {
    var armgroup = createNode("g", {});

    var x1arm = 0;
    var y1arm = y - params.neck_height;
    if (side === "left") {
        x1arm = x + params.body_width / 2.0;
    } else {
        x1arm = x - params.body_width / 2.0;
    }
    
    var x2arm = x1arm + arm_pos_xx[pos] * params.arm_length;
    var y2arm = y1arm + arm_pos_yy[pos] * params.arm_length;

    var arm = createLine(x1arm, y1arm, x2arm, y2arm, "black", 1);

    var x1flag = x1arm + arm_pos_xx[pos] * (params.arm_length - params.flag_length);
    var y1flag = y1arm + arm_pos_yy[pos] * (params.arm_length - params.flag_length);
    var x3flag = x1flag + flag_pos_yy[pos] * params.flag_length;
    var y3flag = y1flag - flag_pos_xx[pos] * params.flag_length;
    var x4flag = x3flag + arm_pos_xx[pos] * params.flag_length;
    var y4flag = y3flag + arm_pos_yy[pos] * params.flag_length;

    var u = [x1flag, x2arm, x3flag, x4flag];
    var v = [y1flag, y2arm, y3flag, y4flag];

    var flag = createPolygon([x1flag, x2arm, x4flag, x3flag],
                             [y1flag, y2arm, y4flag, y3flag],
                             "none", "black", params.flag_contour_width);
    var triangle = createPolygon([x1flag, x2arm, x3flag], [y1flag, y2arm, y3flag],
                                  "red", "red", 1);

    armgroup.appendChild(arm);
    armgroup.appendChild(flag);
    armgroup.appendChild(triangle);
    return armgroup;
}

function createStickmanBase(x, y, params) {
    var group = createNode("g", {stroke: "black", "stroke-width": 1});

    var body = createRect(x - params.body_width / 2.0, y - params.neck_height,
                      params.body_height,          params.body_width,
                      "black", "black", 1);
    
    var head = createCircle(x, y - params.nose_height, params.head_size,
                        "none", "black", 1);
    ylegs1 = y - params.neck_height + params.body_height;
    ylegs2 = ylegs1 + params.legs_height;
    var left_leg = createLine(x, ylegs1, x - params.foot_gap, ylegs2, "black", 1);
    var right_leg = createLine(x, ylegs1, x + params.foot_gap, ylegs2, "black", 1);

    group.appendChild(body);
    group.appendChild(head);
    group.appendChild(left_leg);
    group.appendChild(right_leg);
    return group;
}

function createCircle(cx, cy, radius, fill, stroke, stroke_width) {
    return createNode("circle", {
        cx: cx, cy: cy, r: radius, stroke: stroke, fill: fill, "stroke-width": stroke_width
    });
}

function createLine(x1, y1, x2, y2, stroke, stroke_width) {
    return createNode("line", {
        x1: x1, y1: y1, x2: x2, y2: y2, stroke: stroke, "stroke-width": stroke_width
    });
}

function createRect(x, y, h, w, fill, stroke, stroke_width) {
    return createNode("rect", {
        x: x, y: y, height: h, width: w, stroke: stroke, fill: fill, "stroke-width": stroke_width
    });
}

function createPolygon(xx, yy, fill, stroke, stroke_width) {
    points = xx.map((k, i) => k + ',' + yy[i])
    return createNode("polygon", {
        points: points.join(" "), fill: fill, stroke: stroke, stroke_width: stroke_width
    });
}

function createNode(tag, attr) {
    node = document.createElementNS(svgNS, tag);

    for (var k in attr) {
        node.setAttributeNS(null, k, attr[k]);
    }

    return node;
}


function refresh_params() {
    for (const key in params) {
        const id = key.replace('_', '-');
        const elm = document.getElementById(id);
        if (elm) {
            if (params[key] !== Number(elm.value)) {
                params[key] = Number(elm.value);
                console.log("Changed " + id + " to " + params[key]);
            }
        }
    }
}

function reinit_params() {
    for (const key in params) {
        params[key] = default_params[key];
        const id = key.replace('_', '-');
        document.getElementById(id).value = default_params[key];
    }
}