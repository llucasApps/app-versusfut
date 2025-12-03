module.exports = {

"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[project]/src/lib/mock-data.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

// Mock data para VersusFut
__turbopack_context__.s({
    "allTeams": ()=>allTeams,
    "initialPhotos": ()=>initialPhotos,
    "initialVideos": ()=>initialVideos,
    "initializeFakeData": ()=>initializeFakeData,
    "invites": ()=>invites,
    "matches": ()=>matches,
    "myTeams": ()=>myTeams,
    "opponentTeams": ()=>opponentTeams
});
const myTeams = [
    {
        id: '1',
        name: 'Real Bairro FC',
        logo: '⚽',
        description: 'Time do bairro, raiz desde 2015',
        isMyTeam: true,
        stats: {
            wins: 12,
            draws: 5,
            losses: 3,
            goalsFor: 45,
            goalsAgainst: 18
        },
        players: [
            {
                id: 'p1',
                name: 'Carlos Silva',
                position: 'Goleiro',
                number: 1,
                available: true,
                stats: {
                    goals: 0,
                    assists: 0,
                    matches: 20
                }
            },
            {
                id: 'p2',
                name: 'João Pedro',
                position: 'Zagueiro',
                number: 3,
                available: true,
                stats: {
                    goals: 2,
                    assists: 1,
                    matches: 18
                }
            },
            {
                id: 'p3',
                name: 'Rafael Costa',
                position: 'Meio-Campo',
                number: 8,
                available: false,
                stats: {
                    goals: 5,
                    assists: 8,
                    matches: 20
                }
            },
            {
                id: 'p4',
                name: 'Lucas Martins',
                position: 'Atacante',
                number: 9,
                available: true,
                stats: {
                    goals: 15,
                    assists: 4,
                    matches: 19
                }
            },
            {
                id: 'p5',
                name: 'Bruno Alves',
                position: 'Lateral',
                number: 2,
                available: true,
                stats: {
                    goals: 1,
                    assists: 3,
                    matches: 17
                }
            }
        ]
    },
    {
        id: '2',
        name: 'Veteranos da Vila',
        logo: '🏆',
        description: 'Experiência em campo desde 2010',
        isMyTeam: true,
        stats: {
            wins: 8,
            draws: 7,
            losses: 5,
            goalsFor: 32,
            goalsAgainst: 25
        },
        players: [
            {
                id: 'p6',
                name: 'Roberto Santos',
                position: 'Goleiro',
                number: 1,
                available: true,
                stats: {
                    goals: 0,
                    assists: 0,
                    matches: 15
                }
            },
            {
                id: 'p7',
                name: 'Marcelo Dias',
                position: 'Zagueiro',
                number: 4,
                available: true,
                stats: {
                    goals: 3,
                    assists: 2,
                    matches: 16
                }
            },
            {
                id: 'p8',
                name: 'Fernando Lima',
                position: 'Meio-Campo',
                number: 10,
                available: true,
                stats: {
                    goals: 8,
                    assists: 12,
                    matches: 18
                }
            },
            {
                id: 'p9',
                name: 'André Souza',
                position: 'Atacante',
                number: 11,
                available: false,
                stats: {
                    goals: 12,
                    assists: 5,
                    matches: 17
                }
            }
        ]
    },
    {
        id: '3',
        name: 'Juventude Unidos',
        logo: '⭐',
        description: 'Jovens talentos em ascensão',
        isMyTeam: true,
        stats: {
            wins: 15,
            draws: 3,
            losses: 2,
            goalsFor: 52,
            goalsAgainst: 15
        },
        players: [
            {
                id: 'p10',
                name: 'Gabriel Rocha',
                position: 'Goleiro',
                number: 1,
                available: true,
                stats: {
                    goals: 0,
                    assists: 0,
                    matches: 20
                }
            },
            {
                id: 'p11',
                name: 'Thiago Mendes',
                position: 'Zagueiro',
                number: 5,
                available: true,
                stats: {
                    goals: 4,
                    assists: 2,
                    matches: 19
                }
            },
            {
                id: 'p12',
                name: 'Vinicius Oliveira',
                position: 'Meio-Campo',
                number: 7,
                available: true,
                stats: {
                    goals: 10,
                    assists: 15,
                    matches: 20
                }
            },
            {
                id: 'p13',
                name: 'Pedro Henrique',
                position: 'Atacante',
                number: 9,
                available: true,
                stats: {
                    goals: 22,
                    assists: 8,
                    matches: 20
                }
            },
            {
                id: 'p14',
                name: 'Matheus Ferreira',
                position: 'Lateral',
                number: 6,
                available: true,
                stats: {
                    goals: 2,
                    assists: 6,
                    matches: 18
                }
            },
            {
                id: 'p15',
                name: 'Diego Barbosa',
                position: 'Volante',
                number: 5,
                available: false,
                stats: {
                    goals: 3,
                    assists: 4,
                    matches: 16
                }
            }
        ]
    }
];
const opponentTeams = [
    {
        id: '4',
        name: 'Pelada da Praça',
        logo: '🔥',
        description: 'Time tradicional da praça',
        isMyTeam: false,
        stats: {
            wins: 10,
            draws: 6,
            losses: 4,
            goalsFor: 38,
            goalsAgainst: 22
        },
        players: []
    },
    {
        id: '5',
        name: 'Galera do Sintético',
        logo: '⚡',
        description: 'Especialistas em campo sintético',
        isMyTeam: false,
        stats: {
            wins: 14,
            draws: 4,
            losses: 2,
            goalsFor: 48,
            goalsAgainst: 16
        },
        players: []
    },
    {
        id: '6',
        name: 'Amigos FC',
        logo: '🎯',
        description: 'Unidos pelo futebol',
        isMyTeam: false,
        stats: {
            wins: 7,
            draws: 8,
            losses: 5,
            goalsFor: 28,
            goalsAgainst: 26
        },
        players: []
    }
];
const allTeams = [
    ...myTeams,
    ...opponentTeams
];
const matches = [
    {
        id: 'm1',
        homeTeam: 'Real Bairro FC',
        awayTeam: 'Pelada da Praça',
        date: '2024-02-15',
        time: '19:00',
        location: 'Campo do Bairro',
        status: 'scheduled',
        messages: [
            {
                id: 'msg1',
                sender: 'Real Bairro FC',
                message: 'Podemos começar às 16h em vez de 15h?',
                timestamp: new Date('2024-02-14T10:30:00').toISOString()
            },
            {
                id: 'msg2',
                sender: 'Pelada da Praça',
                message: 'Fechado, 16h!',
                timestamp: new Date('2024-02-14T11:15:00').toISOString()
            },
            {
                id: 'msg3',
                sender: 'Real Bairro FC',
                message: 'Perfeito! Nos vemos lá 👍',
                timestamp: new Date('2024-02-14T11:20:00').toISOString()
            }
        ]
    },
    {
        id: 'm2',
        homeTeam: 'Juventude Unidos',
        awayTeam: 'Galera do Sintético',
        date: '2024-02-18',
        time: '20:00',
        location: 'Arena Sintética',
        status: 'confirmed'
    },
    {
        id: 'm3',
        homeTeam: 'Veteranos da Vila',
        awayTeam: 'Amigos FC',
        date: '2024-02-20',
        time: '18:30',
        location: 'Campo da Vila',
        status: 'pending'
    },
    {
        id: 'm4',
        homeTeam: 'Real Bairro FC',
        awayTeam: 'Juventude Unidos',
        date: '2024-02-10',
        time: '19:00',
        location: 'Campo Central',
        status: 'completed',
        score: {
            home: 2,
            away: 3
        }
    },
    {
        id: 'm5',
        homeTeam: 'Galera do Sintético',
        awayTeam: 'Veteranos da Vila',
        date: '2024-02-08',
        time: '20:30',
        location: 'Arena Sintética',
        status: 'completed',
        score: {
            home: 1,
            away: 1
        }
    }
];
const invites = [
    {
        id: 'i1',
        from: 'Pelada da Praça',
        to: 'Real Bairro FC',
        matchId: 'm1',
        status: 'pending',
        date: '2024-02-15'
    },
    {
        id: 'i2',
        from: 'Juventude Unidos',
        to: 'Galera do Sintético',
        matchId: 'm2',
        status: 'accepted',
        date: '2024-02-18'
    },
    {
        id: 'i3',
        from: 'Amigos FC',
        to: 'Veteranos da Vila',
        matchId: 'm3',
        status: 'pending',
        date: '2024-02-20'
    }
];
const initialPhotos = [
    {
        id: 'foto1',
        timeId: '1',
        url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
        titulo: 'Foto do elenco 2024',
        data: '2024-01-15',
        descricao: 'Time completo reunido para foto oficial da temporada 2024'
    },
    {
        id: 'foto2',
        timeId: '1',
        url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop',
        titulo: 'Amistoso contra Pelada da Praça',
        data: '2024-01-20',
        descricao: 'Jogo amistoso preparatório para o campeonato'
    },
    {
        id: 'foto3',
        timeId: '1',
        url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=600&fit=crop',
        titulo: 'Equipe campeã do torneio local',
        data: '2023-12-10',
        descricao: 'Comemoração do título do torneio de fim de ano'
    },
    {
        id: 'foto4',
        timeId: '1',
        url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=600&fit=crop',
        titulo: 'Treino tático',
        data: '2024-02-01',
        descricao: 'Sessão de treino focada em táticas defensivas'
    }
];
const initialVideos = [
    {
        id: 'video1',
        timeId: '1',
        titulo: 'Técnicas de Finalização - Parte 1',
        descricao: 'Aprenda as melhores técnicas para finalizar com precisão e potência',
        urlEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        categoria: 'Finalização',
        duracao: '12:45'
    },
    {
        id: 'video2',
        timeId: '1',
        titulo: 'Tática 4-4-2: Posicionamento',
        descricao: 'Como se posicionar corretamente na formação 4-4-2',
        urlEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        categoria: 'Tática',
        duracao: '15:30'
    },
    {
        id: 'video3',
        timeId: '1',
        titulo: 'Preparação Física para Futebol',
        descricao: 'Exercícios essenciais para melhorar seu condicionamento físico',
        urlEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        categoria: 'Preparação Física',
        duracao: '18:20'
    },
    {
        id: 'video4',
        timeId: '1',
        titulo: 'Passes Curtos e Longos',
        descricao: 'Domine a arte do passe com estas técnicas fundamentais',
        urlEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        categoria: 'Passe',
        duracao: '10:15'
    },
    {
        id: 'video5',
        timeId: '1',
        titulo: 'Defesa: Marcação Individual',
        descricao: 'Aprenda a marcar seu adversário de forma efetiva',
        urlEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        categoria: 'Defesa',
        duracao: '14:00'
    }
];
function initializeFakeData() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
    // Inicializar fotos para Real Bairro FC
    const existingPhotos = undefined;
    // Inicializar vídeos para Real Bairro FC
    const existingVideos = undefined;
    // Inicializar configurações
    const existingConfig = undefined;
}
}),
"[project]/src/components/DataInitializer.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>DataInitializer
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mock-data.ts [app-ssr] (ecmascript)");
'use client';
;
;
function DataInitializer() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initializeFakeData"])();
    }, []);
    return null;
}
}),
"[project]/node_modules/@swc/helpers/cjs/_interop_require_default.cjs [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
exports._ = _interop_require_default;
}}),
"[project]/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) return obj;
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") return {
        default: obj
    };
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) return cache.get(obj);
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
            else newObj[key] = obj[key];
        }
    }
    newObj.default = obj;
    if (cache) cache.set(obj, newObj);
    return newObj;
}
exports._ = _interop_require_wildcard;
}}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxRuntime; //# sourceMappingURL=react-jsx-runtime.js.map
}}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactDOM; //# sourceMappingURL=react-dom.js.map
}}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/contexts/head-manager-context.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['contexts'].HeadManagerContext; //# sourceMappingURL=head-manager-context.js.map
}}),
"[project]/node_modules/next/dist/client/set-attributes-from-props.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "setAttributesFromProps", {
    enumerable: true,
    get: function() {
        return setAttributesFromProps;
    }
});
const DOMAttributeNames = {
    acceptCharset: 'accept-charset',
    className: 'class',
    htmlFor: 'for',
    httpEquiv: 'http-equiv',
    noModule: 'noModule'
};
const ignoreProps = [
    'onLoad',
    'onReady',
    'dangerouslySetInnerHTML',
    'children',
    'onError',
    'strategy',
    'stylesheets'
];
function isBooleanScriptAttribute(attr) {
    return [
        'async',
        'defer',
        'noModule'
    ].includes(attr);
}
function setAttributesFromProps(el, props) {
    for (const [p, value] of Object.entries(props)){
        if (!props.hasOwnProperty(p)) continue;
        if (ignoreProps.includes(p)) continue;
        // we don't render undefined props to the DOM
        if (value === undefined) {
            continue;
        }
        const attr = DOMAttributeNames[p] || p.toLowerCase();
        if (el.tagName === 'SCRIPT' && isBooleanScriptAttribute(attr)) {
            // Correctly assign boolean script attributes
            // https://github.com/vercel/next.js/pull/20748
            ;
            el[attr] = !!value;
        } else {
            el.setAttribute(attr, String(value));
        }
        // Remove falsy non-zero boolean attributes so they are correctly interpreted
        // (e.g. if we set them to false, this coerces to the string "false", which the browser interprets as true)
        if (value === false || el.tagName === 'SCRIPT' && isBooleanScriptAttribute(attr) && (!value || value === 'false')) {
            // Call setAttribute before, as we need to set and unset the attribute to override force async:
            // https://html.spec.whatwg.org/multipage/scripting.html#script-force-async
            el.setAttribute(attr, '');
            el.removeAttribute(attr);
        }
    }
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=set-attributes-from-props.js.map
}}),
"[project]/node_modules/next/dist/client/request-idle-callback.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    cancelIdleCallback: null,
    requestIdleCallback: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    cancelIdleCallback: function() {
        return cancelIdleCallback;
    },
    requestIdleCallback: function() {
        return requestIdleCallback;
    }
});
const requestIdleCallback = typeof self !== 'undefined' && self.requestIdleCallback && self.requestIdleCallback.bind(window) || function(cb) {
    let start = Date.now();
    return self.setTimeout(function() {
        cb({
            didTimeout: false,
            timeRemaining: function() {
                return Math.max(0, 50 - (Date.now() - start));
            }
        });
    }, 1);
};
const cancelIdleCallback = typeof self !== 'undefined' && self.cancelIdleCallback && self.cancelIdleCallback.bind(window) || function(id) {
    return clearTimeout(id);
};
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=request-idle-callback.js.map
}}),
"[project]/node_modules/next/dist/client/script.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    default: null,
    handleClientScriptLoad: null,
    initScriptLoader: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    handleClientScriptLoad: function() {
        return handleClientScriptLoad;
    },
    initScriptLoader: function() {
        return initScriptLoader;
    }
});
const _interop_require_default = __turbopack_context__.r("[project]/node_modules/@swc/helpers/cjs/_interop_require_default.cjs [app-ssr] (ecmascript)");
const _interop_require_wildcard = __turbopack_context__.r("[project]/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs [app-ssr] (ecmascript)");
const _jsxruntime = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
const _reactdom = /*#__PURE__*/ _interop_require_default._(__turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)"));
const _react = /*#__PURE__*/ _interop_require_wildcard._(__turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)"));
const _headmanagercontextsharedruntime = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/contexts/head-manager-context.js [app-ssr] (ecmascript)");
const _setattributesfromprops = __turbopack_context__.r("[project]/node_modules/next/dist/client/set-attributes-from-props.js [app-ssr] (ecmascript)");
const _requestidlecallback = __turbopack_context__.r("[project]/node_modules/next/dist/client/request-idle-callback.js [app-ssr] (ecmascript)");
const ScriptCache = new Map();
const LoadCache = new Set();
const insertStylesheets = (stylesheets)=>{
    // Case 1: Styles for afterInteractive/lazyOnload with appDir injected via handleClientScriptLoad
    //
    // Using ReactDOM.preinit to feature detect appDir and inject styles
    // Stylesheets might have already been loaded if initialized with Script component
    // Re-inject styles here to handle scripts loaded via handleClientScriptLoad
    // ReactDOM.preinit handles dedup and ensures the styles are loaded only once
    if (_reactdom.default.preinit) {
        stylesheets.forEach((stylesheet)=>{
            _reactdom.default.preinit(stylesheet, {
                as: 'style'
            });
        });
        return;
    }
    // Case 2: Styles for afterInteractive/lazyOnload with pages injected via handleClientScriptLoad
    //
    // We use this function to load styles when appdir is not detected
    // TODO: Use React float APIs to load styles once available for pages dir
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
};
const loadScript = (props)=>{
    const { src, id, onLoad = ()=>{}, onReady = null, dangerouslySetInnerHTML, children = '', strategy = 'afterInteractive', onError, stylesheets } = props;
    const cacheKey = id || src;
    // Script has already loaded
    if (cacheKey && LoadCache.has(cacheKey)) {
        return;
    }
    // Contents of this script are already loading/loaded
    if (ScriptCache.has(src)) {
        LoadCache.add(cacheKey);
        // It is possible that multiple `next/script` components all have same "src", but has different "onLoad"
        // This is to make sure the same remote script will only load once, but "onLoad" are executed in order
        ScriptCache.get(src).then(onLoad, onError);
        return;
    }
    /** Execute after the script first loaded */ const afterLoad = ()=>{
        // Run onReady for the first time after load event
        if (onReady) {
            onReady();
        }
        // add cacheKey to LoadCache when load successfully
        LoadCache.add(cacheKey);
    };
    const el = document.createElement('script');
    const loadPromise = new Promise((resolve, reject)=>{
        el.addEventListener('load', function(e) {
            resolve();
            if (onLoad) {
                onLoad.call(this, e);
            }
            afterLoad();
        });
        el.addEventListener('error', function(e) {
            reject(e);
        });
    }).catch(function(e) {
        if (onError) {
            onError(e);
        }
    });
    if (dangerouslySetInnerHTML) {
        // Casting since lib.dom.d.ts doesn't have TrustedHTML yet.
        el.innerHTML = dangerouslySetInnerHTML.__html || '';
        afterLoad();
    } else if (children) {
        el.textContent = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : '';
        afterLoad();
    } else if (src) {
        el.src = src;
        // do not add cacheKey into LoadCache for remote script here
        // cacheKey will be added to LoadCache when it is actually loaded (see loadPromise above)
        ScriptCache.set(src, loadPromise);
    }
    (0, _setattributesfromprops.setAttributesFromProps)(el, props);
    if (strategy === 'worker') {
        el.setAttribute('type', 'text/partytown');
    }
    el.setAttribute('data-nscript', strategy);
    // Load styles associated with this script
    if (stylesheets) {
        insertStylesheets(stylesheets);
    }
    document.body.appendChild(el);
};
function handleClientScriptLoad(props) {
    const { strategy = 'afterInteractive' } = props;
    if (strategy === 'lazyOnload') {
        window.addEventListener('load', ()=>{
            (0, _requestidlecallback.requestIdleCallback)(()=>loadScript(props));
        });
    } else {
        loadScript(props);
    }
}
function loadLazyScript(props) {
    if (document.readyState === 'complete') {
        (0, _requestidlecallback.requestIdleCallback)(()=>loadScript(props));
    } else {
        window.addEventListener('load', ()=>{
            (0, _requestidlecallback.requestIdleCallback)(()=>loadScript(props));
        });
    }
}
function addBeforeInteractiveToCache() {
    const scripts = [
        ...document.querySelectorAll('[data-nscript="beforeInteractive"]'),
        ...document.querySelectorAll('[data-nscript="beforePageRender"]')
    ];
    scripts.forEach((script)=>{
        const cacheKey = script.id || script.getAttribute('src');
        LoadCache.add(cacheKey);
    });
}
function initScriptLoader(scriptLoaderItems) {
    scriptLoaderItems.forEach(handleClientScriptLoad);
    addBeforeInteractiveToCache();
}
/**
 * Load a third-party scripts in an optimized way.
 *
 * Read more: [Next.js Docs: `next/script`](https://nextjs.org/docs/app/api-reference/components/script)
 */ function Script(props) {
    const { id, src = '', onLoad = ()=>{}, onReady = null, strategy = 'afterInteractive', onError, stylesheets, ...restProps } = props;
    // Context is available only during SSR
    let { updateScripts, scripts, getIsSsr, appDir, nonce } = (0, _react.useContext)(_headmanagercontextsharedruntime.HeadManagerContext);
    // if a nonce is explicitly passed to the script tag, favor that over the automatic handling
    nonce = restProps.nonce || nonce;
    /**
   * - First mount:
   *   1. The useEffect for onReady executes
   *   2. hasOnReadyEffectCalled.current is false, but the script hasn't loaded yet (not in LoadCache)
   *      onReady is skipped, set hasOnReadyEffectCalled.current to true
   *   3. The useEffect for loadScript executes
   *   4. hasLoadScriptEffectCalled.current is false, loadScript executes
   *      Once the script is loaded, the onLoad and onReady will be called by then
   *   [If strict mode is enabled / is wrapped in <OffScreen /> component]
   *   5. The useEffect for onReady executes again
   *   6. hasOnReadyEffectCalled.current is true, so entire effect is skipped
   *   7. The useEffect for loadScript executes again
   *   8. hasLoadScriptEffectCalled.current is true, so entire effect is skipped
   *
   * - Second mount:
   *   1. The useEffect for onReady executes
   *   2. hasOnReadyEffectCalled.current is false, but the script has already loaded (found in LoadCache)
   *      onReady is called, set hasOnReadyEffectCalled.current to true
   *   3. The useEffect for loadScript executes
   *   4. The script is already loaded, loadScript bails out
   *   [If strict mode is enabled / is wrapped in <OffScreen /> component]
   *   5. The useEffect for onReady executes again
   *   6. hasOnReadyEffectCalled.current is true, so entire effect is skipped
   *   7. The useEffect for loadScript executes again
   *   8. hasLoadScriptEffectCalled.current is true, so entire effect is skipped
   */ const hasOnReadyEffectCalled = (0, _react.useRef)(false);
    (0, _react.useEffect)(()=>{
        const cacheKey = id || src;
        if (!hasOnReadyEffectCalled.current) {
            // Run onReady if script has loaded before but component is re-mounted
            if (onReady && cacheKey && LoadCache.has(cacheKey)) {
                onReady();
            }
            hasOnReadyEffectCalled.current = true;
        }
    }, [
        onReady,
        id,
        src
    ]);
    const hasLoadScriptEffectCalled = (0, _react.useRef)(false);
    (0, _react.useEffect)(()=>{
        if (!hasLoadScriptEffectCalled.current) {
            if (strategy === 'afterInteractive') {
                loadScript(props);
            } else if (strategy === 'lazyOnload') {
                loadLazyScript(props);
            }
            hasLoadScriptEffectCalled.current = true;
        }
    }, [
        props,
        strategy
    ]);
    if (strategy === 'beforeInteractive' || strategy === 'worker') {
        if (updateScripts) {
            scripts[strategy] = (scripts[strategy] || []).concat([
                {
                    id,
                    src,
                    onLoad,
                    onReady,
                    onError,
                    ...restProps,
                    nonce
                }
            ]);
            updateScripts(scripts);
        } else if (getIsSsr && getIsSsr()) {
            // Script has already loaded during SSR
            LoadCache.add(id || src);
        } else if (getIsSsr && !getIsSsr()) {
            loadScript({
                ...props,
                nonce
            });
        }
    }
    // For the app directory, we need React Float to preload these scripts.
    if (appDir) {
        // Injecting stylesheets here handles beforeInteractive and worker scripts correctly
        // For other strategies injecting here ensures correct stylesheet order
        // ReactDOM.preinit handles loading the styles in the correct order,
        // also ensures the stylesheet is loaded only once and in a consistent manner
        //
        // Case 1: Styles for beforeInteractive/worker with appDir - handled here
        // Case 2: Styles for beforeInteractive/worker with pages dir - Not handled yet
        // Case 3: Styles for afterInteractive/lazyOnload with appDir - handled here
        // Case 4: Styles for afterInteractive/lazyOnload with pages dir - handled in insertStylesheets function
        if (stylesheets) {
            stylesheets.forEach((styleSrc)=>{
                _reactdom.default.preinit(styleSrc, {
                    as: 'style'
                });
            });
        }
        // Before interactive scripts need to be loaded by Next.js' runtime instead
        // of native <script> tags, because they no longer have `defer`.
        if (strategy === 'beforeInteractive') {
            if (!src) {
                // For inlined scripts, we put the content in `children`.
                if (restProps.dangerouslySetInnerHTML) {
                    // Casting since lib.dom.d.ts doesn't have TrustedHTML yet.
                    restProps.children = restProps.dangerouslySetInnerHTML.__html;
                    delete restProps.dangerouslySetInnerHTML;
                }
                return /*#__PURE__*/ (0, _jsxruntime.jsx)("script", {
                    nonce: nonce,
                    dangerouslySetInnerHTML: {
                        __html: "(self.__next_s=self.__next_s||[]).push(" + JSON.stringify([
                            0,
                            {
                                ...restProps,
                                id
                            }
                        ]) + ")"
                    }
                });
            } else {
                // @ts-ignore
                _reactdom.default.preload(src, restProps.integrity ? {
                    as: 'script',
                    integrity: restProps.integrity,
                    nonce,
                    crossOrigin: restProps.crossOrigin
                } : {
                    as: 'script',
                    nonce,
                    crossOrigin: restProps.crossOrigin
                });
                return /*#__PURE__*/ (0, _jsxruntime.jsx)("script", {
                    nonce: nonce,
                    dangerouslySetInnerHTML: {
                        __html: "(self.__next_s=self.__next_s||[]).push(" + JSON.stringify([
                            src,
                            {
                                ...restProps,
                                id
                            }
                        ]) + ")"
                    }
                });
            }
        } else if (strategy === 'afterInteractive') {
            if (src) {
                // @ts-ignore
                _reactdom.default.preload(src, restProps.integrity ? {
                    as: 'script',
                    integrity: restProps.integrity,
                    nonce,
                    crossOrigin: restProps.crossOrigin
                } : {
                    as: 'script',
                    nonce,
                    crossOrigin: restProps.crossOrigin
                });
            }
        }
    }
    return null;
}
Object.defineProperty(Script, '__nextScript', {
    value: true
});
const _default = Script;
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=script.js.map
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__5d45d69f._.js.map