(function (global, factory) {
            typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
            typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.ufo = {})));
}(this, (function (exports) { 'use strict';

            var global$1 = (typeof global !== "undefined" ? global :
                        typeof self !== "undefined" ? self :
                        typeof window !== "undefined" ? window : {});

            // shim for using process in browser
            // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

            function defaultSetTimout() {
                throw new Error('setTimeout has not been defined');
            }
            function defaultClearTimeout () {
                throw new Error('clearTimeout has not been defined');
            }
            var cachedSetTimeout = defaultSetTimout;
            var cachedClearTimeout = defaultClearTimeout;
            if (typeof global$1.setTimeout === 'function') {
                cachedSetTimeout = setTimeout;
            }
            if (typeof global$1.clearTimeout === 'function') {
                cachedClearTimeout = clearTimeout;
            }

            function runTimeout(fun) {
                if (cachedSetTimeout === setTimeout) {
                    //normal enviroments in sane situations
                    return setTimeout(fun, 0);
                }
                // if setTimeout wasn't available but was latter defined
                if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                    cachedSetTimeout = setTimeout;
                    return setTimeout(fun, 0);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedSetTimeout(fun, 0);
                } catch(e){
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                        return cachedSetTimeout.call(null, fun, 0);
                    } catch(e){
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                        return cachedSetTimeout.call(this, fun, 0);
                    }
                }


            }
            function runClearTimeout(marker) {
                if (cachedClearTimeout === clearTimeout) {
                    //normal enviroments in sane situations
                    return clearTimeout(marker);
                }
                // if clearTimeout wasn't available but was latter defined
                if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                    cachedClearTimeout = clearTimeout;
                    return clearTimeout(marker);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedClearTimeout(marker);
                } catch (e){
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                        return cachedClearTimeout.call(null, marker);
                    } catch (e){
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                        // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                        return cachedClearTimeout.call(this, marker);
                    }
                }



            }
            var queue = [];
            var draining = false;
            var currentQueue;
            var queueIndex = -1;

            function cleanUpNextTick() {
                if (!draining || !currentQueue) {
                    return;
                }
                draining = false;
                if (currentQueue.length) {
                    queue = currentQueue.concat(queue);
                } else {
                    queueIndex = -1;
                }
                if (queue.length) {
                    drainQueue();
                }
            }

            function drainQueue() {
                if (draining) {
                    return;
                }
                var timeout = runTimeout(cleanUpNextTick);
                draining = true;

                var len = queue.length;
                while(len) {
                    currentQueue = queue;
                    queue = [];
                    while (++queueIndex < len) {
                        if (currentQueue) {
                            currentQueue[queueIndex].run();
                        }
                    }
                    queueIndex = -1;
                    len = queue.length;
                }
                currentQueue = null;
                draining = false;
                runClearTimeout(timeout);
            }
            function nextTick(fun) {
                var args = new Array(arguments.length - 1);
                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        args[i - 1] = arguments[i];
                    }
                }
                queue.push(new Item(fun, args));
                if (queue.length === 1 && !draining) {
                    runTimeout(drainQueue);
                }
            }
            // v8 likes predictible objects
            function Item(fun, array) {
                this.fun = fun;
                this.array = array;
            }
            Item.prototype.run = function () {
                this.fun.apply(null, this.array);
            };
            var title = 'browser';
            var platform = 'browser';
            var browser = true;
            var env = {};
            var argv = [];
            var version = ''; // empty string to avoid regexp issues
            var versions = {};
            var release = {};
            var config = {};

            function noop() {}

            var on = noop;
            var addListener = noop;
            var once = noop;
            var off$1 = noop;
            var removeListener = noop;
            var removeAllListeners = noop;
            var emit = noop;

            function binding(name) {
                throw new Error('process.binding is not supported');
            }

            function cwd () { return '/' }
            function chdir (dir) {
                throw new Error('process.chdir is not supported');
            }function umask() { return 0; }

            // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
            var performance = global$1.performance || {};
            var performanceNow =
              performance.now        ||
              performance.mozNow     ||
              performance.msNow      ||
              performance.oNow       ||
              performance.webkitNow  ||
              function(){ return (new Date()).getTime() };

            // generate timestamp or delta
            // see http://nodejs.org/api/process.html#process_process_hrtime
            function hrtime(previousTimestamp){
              var clocktime = performanceNow.call(performance)*1e-3;
              var seconds = Math.floor(clocktime);
              var nanoseconds = Math.floor((clocktime%1)*1e9);
              if (previousTimestamp) {
                seconds = seconds - previousTimestamp[0];
                nanoseconds = nanoseconds - previousTimestamp[1];
                if (nanoseconds<0) {
                  seconds--;
                  nanoseconds += 1e9;
                }
              }
              return [seconds,nanoseconds]
            }

            var startTime = new Date();
            function uptime() {
              var currentTime = new Date();
              var dif = currentTime - startTime;
              return dif / 1000;
            }

            var process = {
              nextTick: nextTick,
              title: title,
              browser: browser,
              env: env,
              argv: argv,
              version: version,
              versions: versions,
              on: on,
              addListener: addListener,
              once: once,
              off: off$1,
              removeListener: removeListener,
              removeAllListeners: removeAllListeners,
              emit: emit,
              binding: binding,
              cwd: cwd,
              chdir: chdir,
              umask: umask,
              hrtime: hrtime,
              platform: platform,
              release: release,
              config: config,
              uptime: uptime
            };

            var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

            function createCommonjsModule(fn, module) {
            	return module = { exports: {} }, fn(module, module.exports), module.exports;
            }

            var bluebird = createCommonjsModule(function (module, exports) {
            /* @preserve
             * The MIT License (MIT)
             * 
             * Copyright (c) 2013-2018 Petka Antonov
             * 
             * Permission is hereby granted, free of charge, to any person obtaining a copy
             * of this software and associated documentation files (the "Software"), to deal
             * in the Software without restriction, including without limitation the rights
             * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
             * copies of the Software, and to permit persons to whom the Software is
             * furnished to do so, subject to the following conditions:
             * 
             * The above copyright notice and this permission notice shall be included in
             * all copies or substantial portions of the Software.
             * 
             * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
             * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
             * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
             * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
             * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
             * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
             * THE SOFTWARE.
             * 
             */
            /**
             * bluebird build version 3.5.2
             * Features enabled: core, race, call_get, generators, map, nodeify, promisify, props, reduce, settle, some, using, timers, filter, any, each
            */
            !function(e){module.exports=e();}(function(){return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r);}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
            module.exports = function(Promise) {
            var SomePromiseArray = Promise._SomePromiseArray;
            function any(promises) {
                var ret = new SomePromiseArray(promises);
                var promise = ret.promise();
                ret.setHowMany(1);
                ret.setUnwrap();
                ret.init();
                return promise;
            }

            Promise.any = function (promises) {
                return any(promises);
            };

            Promise.prototype.any = function () {
                return any(this);
            };

            };

            },{}],2:[function(_dereq_,module,exports){
            var firstLineError;
            try {throw new Error(); } catch (e) {firstLineError = e;}
            var schedule = _dereq_("./schedule");
            var Queue = _dereq_("./queue");
            var util = _dereq_("./util");

            function Async() {
                this._customScheduler = false;
                this._isTickUsed = false;
                this._lateQueue = new Queue(16);
                this._normalQueue = new Queue(16);
                this._haveDrainedQueues = false;
                this._trampolineEnabled = true;
                var self = this;
                this.drainQueues = function () {
                    self._drainQueues();
                };
                this._schedule = schedule;
            }

            Async.prototype.setScheduler = function(fn) {
                var prev = this._schedule;
                this._schedule = fn;
                this._customScheduler = true;
                return prev;
            };

            Async.prototype.hasCustomScheduler = function() {
                return this._customScheduler;
            };

            Async.prototype.enableTrampoline = function() {
                this._trampolineEnabled = true;
            };

            Async.prototype.disableTrampolineIfNecessary = function() {
                if (util.hasDevTools) {
                    this._trampolineEnabled = false;
                }
            };

            Async.prototype.haveItemsQueued = function () {
                return this._isTickUsed || this._haveDrainedQueues;
            };


            Async.prototype.fatalError = function(e, isNode) {
                if (isNode) {
                    process.stderr.write("Fatal " + (e instanceof Error ? e.stack : e) +
                        "\n");
                    process.exit(2);
                } else {
                    this.throwLater(e);
                }
            };

            Async.prototype.throwLater = function(fn, arg) {
                if (arguments.length === 1) {
                    arg = fn;
                    fn = function () { throw arg; };
                }
                if (typeof setTimeout !== "undefined") {
                    setTimeout(function() {
                        fn(arg);
                    }, 0);
                } else try {
                    this._schedule(function() {
                        fn(arg);
                    });
                } catch (e) {
                    throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
                }
            };

            function AsyncInvokeLater(fn, receiver, arg) {
                this._lateQueue.push(fn, receiver, arg);
                this._queueTick();
            }

            function AsyncInvoke(fn, receiver, arg) {
                this._normalQueue.push(fn, receiver, arg);
                this._queueTick();
            }

            function AsyncSettlePromises(promise) {
                this._normalQueue._pushOne(promise);
                this._queueTick();
            }

            if (!util.hasDevTools) {
                Async.prototype.invokeLater = AsyncInvokeLater;
                Async.prototype.invoke = AsyncInvoke;
                Async.prototype.settlePromises = AsyncSettlePromises;
            } else {
                Async.prototype.invokeLater = function (fn, receiver, arg) {
                    if (this._trampolineEnabled) {
                        AsyncInvokeLater.call(this, fn, receiver, arg);
                    } else {
                        this._schedule(function() {
                            setTimeout(function() {
                                fn.call(receiver, arg);
                            }, 100);
                        });
                    }
                };

                Async.prototype.invoke = function (fn, receiver, arg) {
                    if (this._trampolineEnabled) {
                        AsyncInvoke.call(this, fn, receiver, arg);
                    } else {
                        this._schedule(function() {
                            fn.call(receiver, arg);
                        });
                    }
                };

                Async.prototype.settlePromises = function(promise) {
                    if (this._trampolineEnabled) {
                        AsyncSettlePromises.call(this, promise);
                    } else {
                        this._schedule(function() {
                            promise._settlePromises();
                        });
                    }
                };
            }

            function _drainQueue(queue) {
                while (queue.length() > 0) {
                    _drainQueueStep(queue);
                }
            }

            function _drainQueueStep(queue) {
                var fn = queue.shift();
                if (typeof fn !== "function") {
                    fn._settlePromises();
                } else {
                    var receiver = queue.shift();
                    var arg = queue.shift();
                    fn.call(receiver, arg);
                }
            }

            Async.prototype._drainQueues = function () {
                _drainQueue(this._normalQueue);
                this._reset();
                this._haveDrainedQueues = true;
                _drainQueue(this._lateQueue);
            };

            Async.prototype._queueTick = function () {
                if (!this._isTickUsed) {
                    this._isTickUsed = true;
                    this._schedule(this.drainQueues);
                }
            };

            Async.prototype._reset = function () {
                this._isTickUsed = false;
            };

            module.exports = Async;
            module.exports.firstLineError = firstLineError;

            },{"./queue":26,"./schedule":29,"./util":36}],3:[function(_dereq_,module,exports){
            module.exports = function(Promise, INTERNAL, tryConvertToPromise, debug) {
            var calledBind = false;
            var rejectThis = function(_, e) {
                this._reject(e);
            };

            var targetRejected = function(e, context) {
                context.promiseRejectionQueued = true;
                context.bindingPromise._then(rejectThis, rejectThis, null, this, e);
            };

            var bindingResolved = function(thisArg, context) {
                if (((this._bitField & 50397184) === 0)) {
                    this._resolveCallback(context.target);
                }
            };

            var bindingRejected = function(e, context) {
                if (!context.promiseRejectionQueued) this._reject(e);
            };

            Promise.prototype.bind = function (thisArg) {
                if (!calledBind) {
                    calledBind = true;
                    Promise.prototype._propagateFrom = debug.propagateFromFunction();
                    Promise.prototype._boundValue = debug.boundValueFunction();
                }
                var maybePromise = tryConvertToPromise(thisArg);
                var ret = new Promise(INTERNAL);
                ret._propagateFrom(this, 1);
                var target = this._target();
                ret._setBoundTo(maybePromise);
                if (maybePromise instanceof Promise) {
                    var context = {
                        promiseRejectionQueued: false,
                        promise: ret,
                        target: target,
                        bindingPromise: maybePromise
                    };
                    target._then(INTERNAL, targetRejected, undefined, ret, context);
                    maybePromise._then(
                        bindingResolved, bindingRejected, undefined, ret, context);
                    ret._setOnCancel(maybePromise);
                } else {
                    ret._resolveCallback(target);
                }
                return ret;
            };

            Promise.prototype._setBoundTo = function (obj) {
                if (obj !== undefined) {
                    this._bitField = this._bitField | 2097152;
                    this._boundTo = obj;
                } else {
                    this._bitField = this._bitField & (~2097152);
                }
            };

            Promise.prototype._isBound = function () {
                return (this._bitField & 2097152) === 2097152;
            };

            Promise.bind = function (thisArg, value) {
                return Promise.resolve(value).bind(thisArg);
            };
            };

            },{}],4:[function(_dereq_,module,exports){
            var old;
            if (typeof Promise !== "undefined") old = Promise;
            function noConflict() {
                try { if (Promise === bluebird) Promise = old; }
                catch (e) {}
                return bluebird;
            }
            var bluebird = _dereq_("./promise")();
            bluebird.noConflict = noConflict;
            module.exports = bluebird;

            },{"./promise":22}],5:[function(_dereq_,module,exports){
            var cr = Object.create;
            if (cr) {
                var callerCache = cr(null);
                var getterCache = cr(null);
                callerCache[" size"] = getterCache[" size"] = 0;
            }

            module.exports = function(Promise) {
            var util = _dereq_("./util");
            var canEvaluate = util.canEvaluate;
            var isIdentifier = util.isIdentifier;
            var getGetter;

            function ensureMethod(obj, methodName) {
                var fn;
                if (obj != null) fn = obj[methodName];
                if (typeof fn !== "function") {
                    var message = "Object " + util.classString(obj) + " has no method '" +
                        util.toString(methodName) + "'";
                    throw new Promise.TypeError(message);
                }
                return fn;
            }

            function caller(obj) {
                var methodName = this.pop();
                var fn = ensureMethod(obj, methodName);
                return fn.apply(obj, this);
            }
            Promise.prototype.call = function (methodName) {
                var args = [].slice.call(arguments, 1);    args.push(methodName);
                return this._then(caller, undefined, undefined, args, undefined);
            };

            function namedGetter(obj) {
                return obj[this];
            }
            function indexedGetter(obj) {
                var index = +this;
                if (index < 0) index = Math.max(0, index + obj.length);
                return obj[index];
            }
            Promise.prototype.get = function (propertyName) {
                var isIndex = (typeof propertyName === "number");
                var getter;
                if (!isIndex) {
                    if (canEvaluate) {
                        var maybeGetter = getGetter(propertyName);
                        getter = maybeGetter !== null ? maybeGetter : namedGetter;
                    } else {
                        getter = namedGetter;
                    }
                } else {
                    getter = indexedGetter;
                }
                return this._then(getter, undefined, undefined, propertyName, undefined);
            };
            };

            },{"./util":36}],6:[function(_dereq_,module,exports){
            module.exports = function(Promise, PromiseArray, apiRejection, debug) {
            var util = _dereq_("./util");
            var tryCatch = util.tryCatch;
            var errorObj = util.errorObj;
            var async = Promise._async;

            Promise.prototype["break"] = Promise.prototype.cancel = function() {
                if (!debug.cancellation()) return this._warn("cancellation is disabled");

                var promise = this;
                var child = promise;
                while (promise._isCancellable()) {
                    if (!promise._cancelBy(child)) {
                        if (child._isFollowing()) {
                            child._followee().cancel();
                        } else {
                            child._cancelBranched();
                        }
                        break;
                    }

                    var parent = promise._cancellationParent;
                    if (parent == null || !parent._isCancellable()) {
                        if (promise._isFollowing()) {
                            promise._followee().cancel();
                        } else {
                            promise._cancelBranched();
                        }
                        break;
                    } else {
                        if (promise._isFollowing()) promise._followee().cancel();
                        promise._setWillBeCancelled();
                        child = promise;
                        promise = parent;
                    }
                }
            };

            Promise.prototype._branchHasCancelled = function() {
                this._branchesRemainingToCancel--;
            };

            Promise.prototype._enoughBranchesHaveCancelled = function() {
                return this._branchesRemainingToCancel === undefined ||
                       this._branchesRemainingToCancel <= 0;
            };

            Promise.prototype._cancelBy = function(canceller) {
                if (canceller === this) {
                    this._branchesRemainingToCancel = 0;
                    this._invokeOnCancel();
                    return true;
                } else {
                    this._branchHasCancelled();
                    if (this._enoughBranchesHaveCancelled()) {
                        this._invokeOnCancel();
                        return true;
                    }
                }
                return false;
            };

            Promise.prototype._cancelBranched = function() {
                if (this._enoughBranchesHaveCancelled()) {
                    this._cancel();
                }
            };

            Promise.prototype._cancel = function() {
                if (!this._isCancellable()) return;
                this._setCancelled();
                async.invoke(this._cancelPromises, this, undefined);
            };

            Promise.prototype._cancelPromises = function() {
                if (this._length() > 0) this._settlePromises();
            };

            Promise.prototype._unsetOnCancel = function() {
                this._onCancelField = undefined;
            };

            Promise.prototype._isCancellable = function() {
                return this.isPending() && !this._isCancelled();
            };

            Promise.prototype.isCancellable = function() {
                return this.isPending() && !this.isCancelled();
            };

            Promise.prototype._doInvokeOnCancel = function(onCancelCallback, internalOnly) {
                if (util.isArray(onCancelCallback)) {
                    for (var i = 0; i < onCancelCallback.length; ++i) {
                        this._doInvokeOnCancel(onCancelCallback[i], internalOnly);
                    }
                } else if (onCancelCallback !== undefined) {
                    if (typeof onCancelCallback === "function") {
                        if (!internalOnly) {
                            var e = tryCatch(onCancelCallback).call(this._boundValue());
                            if (e === errorObj) {
                                this._attachExtraTrace(e.e);
                                async.throwLater(e.e);
                            }
                        }
                    } else {
                        onCancelCallback._resultCancelled(this);
                    }
                }
            };

            Promise.prototype._invokeOnCancel = function() {
                var onCancelCallback = this._onCancel();
                this._unsetOnCancel();
                async.invoke(this._doInvokeOnCancel, this, onCancelCallback);
            };

            Promise.prototype._invokeInternalOnCancel = function() {
                if (this._isCancellable()) {
                    this._doInvokeOnCancel(this._onCancel(), true);
                    this._unsetOnCancel();
                }
            };

            Promise.prototype._resultCancelled = function() {
                this.cancel();
            };

            };

            },{"./util":36}],7:[function(_dereq_,module,exports){
            module.exports = function(NEXT_FILTER) {
            var util = _dereq_("./util");
            var getKeys = _dereq_("./es5").keys;
            var tryCatch = util.tryCatch;
            var errorObj = util.errorObj;

            function catchFilter(instances, cb, promise) {
                return function(e) {
                    var boundTo = promise._boundValue();
                    predicateLoop: for (var i = 0; i < instances.length; ++i) {
                        var item = instances[i];

                        if (item === Error ||
                            (item != null && item.prototype instanceof Error)) {
                            if (e instanceof item) {
                                return tryCatch(cb).call(boundTo, e);
                            }
                        } else if (typeof item === "function") {
                            var matchesPredicate = tryCatch(item).call(boundTo, e);
                            if (matchesPredicate === errorObj) {
                                return matchesPredicate;
                            } else if (matchesPredicate) {
                                return tryCatch(cb).call(boundTo, e);
                            }
                        } else if (util.isObject(e)) {
                            var keys = getKeys(item);
                            for (var j = 0; j < keys.length; ++j) {
                                var key = keys[j];
                                if (item[key] != e[key]) {
                                    continue predicateLoop;
                                }
                            }
                            return tryCatch(cb).call(boundTo, e);
                        }
                    }
                    return NEXT_FILTER;
                };
            }

            return catchFilter;
            };

            },{"./es5":13,"./util":36}],8:[function(_dereq_,module,exports){
            module.exports = function(Promise) {
            var longStackTraces = false;
            var contextStack = [];

            Promise.prototype._promiseCreated = function() {};
            Promise.prototype._pushContext = function() {};
            Promise.prototype._popContext = function() {return null;};
            Promise._peekContext = Promise.prototype._peekContext = function() {};

            function Context() {
                this._trace = new Context.CapturedTrace(peekContext());
            }
            Context.prototype._pushContext = function () {
                if (this._trace !== undefined) {
                    this._trace._promiseCreated = null;
                    contextStack.push(this._trace);
                }
            };

            Context.prototype._popContext = function () {
                if (this._trace !== undefined) {
                    var trace = contextStack.pop();
                    var ret = trace._promiseCreated;
                    trace._promiseCreated = null;
                    return ret;
                }
                return null;
            };

            function createContext() {
                if (longStackTraces) return new Context();
            }

            function peekContext() {
                var lastIndex = contextStack.length - 1;
                if (lastIndex >= 0) {
                    return contextStack[lastIndex];
                }
                return undefined;
            }
            Context.CapturedTrace = null;
            Context.create = createContext;
            Context.deactivateLongStackTraces = function() {};
            Context.activateLongStackTraces = function() {
                var Promise_pushContext = Promise.prototype._pushContext;
                var Promise_popContext = Promise.prototype._popContext;
                var Promise_PeekContext = Promise._peekContext;
                var Promise_peekContext = Promise.prototype._peekContext;
                var Promise_promiseCreated = Promise.prototype._promiseCreated;
                Context.deactivateLongStackTraces = function() {
                    Promise.prototype._pushContext = Promise_pushContext;
                    Promise.prototype._popContext = Promise_popContext;
                    Promise._peekContext = Promise_PeekContext;
                    Promise.prototype._peekContext = Promise_peekContext;
                    Promise.prototype._promiseCreated = Promise_promiseCreated;
                    longStackTraces = false;
                };
                longStackTraces = true;
                Promise.prototype._pushContext = Context.prototype._pushContext;
                Promise.prototype._popContext = Context.prototype._popContext;
                Promise._peekContext = Promise.prototype._peekContext = peekContext;
                Promise.prototype._promiseCreated = function() {
                    var ctx = this._peekContext();
                    if (ctx && ctx._promiseCreated == null) ctx._promiseCreated = this;
                };
            };
            return Context;
            };

            },{}],9:[function(_dereq_,module,exports){
            module.exports = function(Promise, Context) {
            var getDomain = Promise._getDomain;
            var async = Promise._async;
            var Warning = _dereq_("./errors").Warning;
            var util = _dereq_("./util");
            var es5 = _dereq_("./es5");
            var canAttachTrace = util.canAttachTrace;
            var unhandledRejectionHandled;
            var possiblyUnhandledRejection;
            var bluebirdFramePattern =
                /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/;
            var nodeFramePattern = /\((?:timers\.js):\d+:\d+\)/;
            var parseLinePattern = /[\/<\(](.+?):(\d+):(\d+)\)?\s*$/;
            var stackFramePattern = null;
            var formatStack = null;
            var indentStackFrames = false;
            var printWarning;
            var debugging = !!(util.env("BLUEBIRD_DEBUG") != 0 &&
                                    (true));

            var warnings = !!(util.env("BLUEBIRD_WARNINGS") != 0 &&
                (debugging || util.env("BLUEBIRD_WARNINGS")));

            var longStackTraces = !!(util.env("BLUEBIRD_LONG_STACK_TRACES") != 0 &&
                (debugging || util.env("BLUEBIRD_LONG_STACK_TRACES")));

            var wForgottenReturn = util.env("BLUEBIRD_W_FORGOTTEN_RETURN") != 0 &&
                (warnings || !!util.env("BLUEBIRD_W_FORGOTTEN_RETURN"));

            Promise.prototype.suppressUnhandledRejections = function() {
                var target = this._target();
                target._bitField = ((target._bitField & (~1048576)) |
                                  524288);
            };

            Promise.prototype._ensurePossibleRejectionHandled = function () {
                if ((this._bitField & 524288) !== 0) return;
                this._setRejectionIsUnhandled();
                var self = this;
                setTimeout(function() {
                    self._notifyUnhandledRejection();
                }, 1);
            };

            Promise.prototype._notifyUnhandledRejectionIsHandled = function () {
                fireRejectionEvent("rejectionHandled",
                                              unhandledRejectionHandled, undefined, this);
            };

            Promise.prototype._setReturnedNonUndefined = function() {
                this._bitField = this._bitField | 268435456;
            };

            Promise.prototype._returnedNonUndefined = function() {
                return (this._bitField & 268435456) !== 0;
            };

            Promise.prototype._notifyUnhandledRejection = function () {
                if (this._isRejectionUnhandled()) {
                    var reason = this._settledValue();
                    this._setUnhandledRejectionIsNotified();
                    fireRejectionEvent("unhandledRejection",
                                                  possiblyUnhandledRejection, reason, this);
                }
            };

            Promise.prototype._setUnhandledRejectionIsNotified = function () {
                this._bitField = this._bitField | 262144;
            };

            Promise.prototype._unsetUnhandledRejectionIsNotified = function () {
                this._bitField = this._bitField & (~262144);
            };

            Promise.prototype._isUnhandledRejectionNotified = function () {
                return (this._bitField & 262144) > 0;
            };

            Promise.prototype._setRejectionIsUnhandled = function () {
                this._bitField = this._bitField | 1048576;
            };

            Promise.prototype._unsetRejectionIsUnhandled = function () {
                this._bitField = this._bitField & (~1048576);
                if (this._isUnhandledRejectionNotified()) {
                    this._unsetUnhandledRejectionIsNotified();
                    this._notifyUnhandledRejectionIsHandled();
                }
            };

            Promise.prototype._isRejectionUnhandled = function () {
                return (this._bitField & 1048576) > 0;
            };

            Promise.prototype._warn = function(message, shouldUseOwnTrace, promise) {
                return warn(message, shouldUseOwnTrace, promise || this);
            };

            Promise.onPossiblyUnhandledRejection = function (fn) {
                var domain = getDomain();
                possiblyUnhandledRejection =
                    typeof fn === "function" ? (domain === null ?
                                                        fn : util.domainBind(domain, fn))
                                             : undefined;
            };

            Promise.onUnhandledRejectionHandled = function (fn) {
                var domain = getDomain();
                unhandledRejectionHandled =
                    typeof fn === "function" ? (domain === null ?
                                                        fn : util.domainBind(domain, fn))
                                             : undefined;
            };

            var disableLongStackTraces = function() {};
            Promise.longStackTraces = function () {
                if (async.haveItemsQueued() && !config$$1.longStackTraces) {
                    throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
                }
                if (!config$$1.longStackTraces && longStackTracesIsSupported()) {
                    var Promise_captureStackTrace = Promise.prototype._captureStackTrace;
                    var Promise_attachExtraTrace = Promise.prototype._attachExtraTrace;
                    var Promise_dereferenceTrace = Promise.prototype._dereferenceTrace;
                    config$$1.longStackTraces = true;
                    disableLongStackTraces = function() {
                        if (async.haveItemsQueued() && !config$$1.longStackTraces) {
                            throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
                        }
                        Promise.prototype._captureStackTrace = Promise_captureStackTrace;
                        Promise.prototype._attachExtraTrace = Promise_attachExtraTrace;
                        Promise.prototype._dereferenceTrace = Promise_dereferenceTrace;
                        Context.deactivateLongStackTraces();
                        async.enableTrampoline();
                        config$$1.longStackTraces = false;
                    };
                    Promise.prototype._captureStackTrace = longStackTracesCaptureStackTrace;
                    Promise.prototype._attachExtraTrace = longStackTracesAttachExtraTrace;
                    Promise.prototype._dereferenceTrace = longStackTracesDereferenceTrace;
                    Context.activateLongStackTraces();
                    async.disableTrampolineIfNecessary();
                }
            };

            Promise.hasLongStackTraces = function () {
                return config$$1.longStackTraces && longStackTracesIsSupported();
            };

            var fireDomEvent = (function() {
                try {
                    if (typeof CustomEvent === "function") {
                        var event = new CustomEvent("CustomEvent");
                        util.global.dispatchEvent(event);
                        return function(name, event) {
                            var eventData = {
                                detail: event,
                                cancelable: true
                            };
                            es5.defineProperty(
                                eventData, "promise", {value: event.promise});
                            es5.defineProperty(eventData, "reason", {value: event.reason});
                            var domEvent = new CustomEvent(name.toLowerCase(), eventData);
                            return !util.global.dispatchEvent(domEvent);
                        };
                    } else if (typeof Event === "function") {
                        var event = new Event("CustomEvent");
                        util.global.dispatchEvent(event);
                        return function(name, event) {
                            var domEvent = new Event(name.toLowerCase(), {
                                cancelable: true
                            });
                            domEvent.detail = event;
                            es5.defineProperty(domEvent, "promise", {value: event.promise});
                            es5.defineProperty(domEvent, "reason", {value: event.reason});
                            return !util.global.dispatchEvent(domEvent);
                        };
                    } else {
                        var event = document.createEvent("CustomEvent");
                        event.initCustomEvent("testingtheevent", false, true, {});
                        util.global.dispatchEvent(event);
                        return function(name, event) {
                            var domEvent = document.createEvent("CustomEvent");
                            domEvent.initCustomEvent(name.toLowerCase(), false, true,
                                event);
                            return !util.global.dispatchEvent(domEvent);
                        };
                    }
                } catch (e) {}
                return function() {
                    return false;
                };
            })();

            var fireGlobalEvent = (function() {
                if (util.isNode) {
                    return function() {
                        return process.emit.apply(process, arguments);
                    };
                } else {
                    if (!util.global) {
                        return function() {
                            return false;
                        };
                    }
                    return function(name) {
                        var methodName = "on" + name.toLowerCase();
                        var method = util.global[methodName];
                        if (!method) return false;
                        method.apply(util.global, [].slice.call(arguments, 1));
                        return true;
                    };
                }
            })();

            function generatePromiseLifecycleEventObject(name, promise) {
                return {promise: promise};
            }

            var eventToObjectGenerator = {
                promiseCreated: generatePromiseLifecycleEventObject,
                promiseFulfilled: generatePromiseLifecycleEventObject,
                promiseRejected: generatePromiseLifecycleEventObject,
                promiseResolved: generatePromiseLifecycleEventObject,
                promiseCancelled: generatePromiseLifecycleEventObject,
                promiseChained: function(name, promise, child) {
                    return {promise: promise, child: child};
                },
                warning: function(name, warning) {
                    return {warning: warning};
                },
                unhandledRejection: function (name, reason, promise) {
                    return {reason: reason, promise: promise};
                },
                rejectionHandled: generatePromiseLifecycleEventObject
            };

            var activeFireEvent = function (name) {
                var globalEventFired = false;
                try {
                    globalEventFired = fireGlobalEvent.apply(null, arguments);
                } catch (e) {
                    async.throwLater(e);
                    globalEventFired = true;
                }

                var domEventFired = false;
                try {
                    domEventFired = fireDomEvent(name,
                                eventToObjectGenerator[name].apply(null, arguments));
                } catch (e) {
                    async.throwLater(e);
                    domEventFired = true;
                }

                return domEventFired || globalEventFired;
            };

            Promise.config = function(opts) {
                opts = Object(opts);
                if ("longStackTraces" in opts) {
                    if (opts.longStackTraces) {
                        Promise.longStackTraces();
                    } else if (!opts.longStackTraces && Promise.hasLongStackTraces()) {
                        disableLongStackTraces();
                    }
                }
                if ("warnings" in opts) {
                    var warningsOption = opts.warnings;
                    config$$1.warnings = !!warningsOption;
                    wForgottenReturn = config$$1.warnings;

                    if (util.isObject(warningsOption)) {
                        if ("wForgottenReturn" in warningsOption) {
                            wForgottenReturn = !!warningsOption.wForgottenReturn;
                        }
                    }
                }
                if ("cancellation" in opts && opts.cancellation && !config$$1.cancellation) {
                    if (async.haveItemsQueued()) {
                        throw new Error(
                            "cannot enable cancellation after promises are in use");
                    }
                    Promise.prototype._clearCancellationData =
                        cancellationClearCancellationData;
                    Promise.prototype._propagateFrom = cancellationPropagateFrom;
                    Promise.prototype._onCancel = cancellationOnCancel;
                    Promise.prototype._setOnCancel = cancellationSetOnCancel;
                    Promise.prototype._attachCancellationCallback =
                        cancellationAttachCancellationCallback;
                    Promise.prototype._execute = cancellationExecute;
                    propagateFromFunction = cancellationPropagateFrom;
                    config$$1.cancellation = true;
                }
                if ("monitoring" in opts) {
                    if (opts.monitoring && !config$$1.monitoring) {
                        config$$1.monitoring = true;
                        Promise.prototype._fireEvent = activeFireEvent;
                    } else if (!opts.monitoring && config$$1.monitoring) {
                        config$$1.monitoring = false;
                        Promise.prototype._fireEvent = defaultFireEvent;
                    }
                }
                return Promise;
            };

            function defaultFireEvent() { return false; }

            Promise.prototype._fireEvent = defaultFireEvent;
            Promise.prototype._execute = function(executor, resolve, reject) {
                try {
                    executor(resolve, reject);
                } catch (e) {
                    return e;
                }
            };
            Promise.prototype._onCancel = function () {};
            Promise.prototype._setOnCancel = function (handler) { };
            Promise.prototype._attachCancellationCallback = function(onCancel) {
            };
            Promise.prototype._captureStackTrace = function () {};
            Promise.prototype._attachExtraTrace = function () {};
            Promise.prototype._dereferenceTrace = function () {};
            Promise.prototype._clearCancellationData = function() {};
            Promise.prototype._propagateFrom = function (parent, flags) {
            };

            function cancellationExecute(executor, resolve, reject) {
                var promise = this;
                try {
                    executor(resolve, reject, function(onCancel) {
                        if (typeof onCancel !== "function") {
                            throw new TypeError("onCancel must be a function, got: " +
                                                util.toString(onCancel));
                        }
                        promise._attachCancellationCallback(onCancel);
                    });
                } catch (e) {
                    return e;
                }
            }

            function cancellationAttachCancellationCallback(onCancel) {
                if (!this._isCancellable()) return this;

                var previousOnCancel = this._onCancel();
                if (previousOnCancel !== undefined) {
                    if (util.isArray(previousOnCancel)) {
                        previousOnCancel.push(onCancel);
                    } else {
                        this._setOnCancel([previousOnCancel, onCancel]);
                    }
                } else {
                    this._setOnCancel(onCancel);
                }
            }

            function cancellationOnCancel() {
                return this._onCancelField;
            }

            function cancellationSetOnCancel(onCancel) {
                this._onCancelField = onCancel;
            }

            function cancellationClearCancellationData() {
                this._cancellationParent = undefined;
                this._onCancelField = undefined;
            }

            function cancellationPropagateFrom(parent, flags) {
                if ((flags & 1) !== 0) {
                    this._cancellationParent = parent;
                    var branchesRemainingToCancel = parent._branchesRemainingToCancel;
                    if (branchesRemainingToCancel === undefined) {
                        branchesRemainingToCancel = 0;
                    }
                    parent._branchesRemainingToCancel = branchesRemainingToCancel + 1;
                }
                if ((flags & 2) !== 0 && parent._isBound()) {
                    this._setBoundTo(parent._boundTo);
                }
            }

            function bindingPropagateFrom(parent, flags) {
                if ((flags & 2) !== 0 && parent._isBound()) {
                    this._setBoundTo(parent._boundTo);
                }
            }
            var propagateFromFunction = bindingPropagateFrom;

            function boundValueFunction() {
                var ret = this._boundTo;
                if (ret !== undefined) {
                    if (ret instanceof Promise) {
                        if (ret.isFulfilled()) {
                            return ret.value();
                        } else {
                            return undefined;
                        }
                    }
                }
                return ret;
            }

            function longStackTracesCaptureStackTrace() {
                this._trace = new CapturedTrace(this._peekContext());
            }

            function longStackTracesAttachExtraTrace(error, ignoreSelf) {
                if (canAttachTrace(error)) {
                    var trace = this._trace;
                    if (trace !== undefined) {
                        if (ignoreSelf) trace = trace._parent;
                    }
                    if (trace !== undefined) {
                        trace.attachExtraTrace(error);
                    } else if (!error.__stackCleaned__) {
                        var parsed = parseStackAndMessage(error);
                        util.notEnumerableProp(error, "stack",
                            parsed.message + "\n" + parsed.stack.join("\n"));
                        util.notEnumerableProp(error, "__stackCleaned__", true);
                    }
                }
            }

            function longStackTracesDereferenceTrace() {
                this._trace = undefined;
            }

            function checkForgottenReturns(returnValue, promiseCreated, name, promise,
                                           parent) {
                if (returnValue === undefined && promiseCreated !== null &&
                    wForgottenReturn) {
                    if (parent !== undefined && parent._returnedNonUndefined()) return;
                    if ((promise._bitField & 65535) === 0) return;

                    if (name) name = name + " ";
                    var handlerLine = "";
                    var creatorLine = "";
                    if (promiseCreated._trace) {
                        var traceLines = promiseCreated._trace.stack.split("\n");
                        var stack = cleanStack(traceLines);
                        for (var i = stack.length - 1; i >= 0; --i) {
                            var line = stack[i];
                            if (!nodeFramePattern.test(line)) {
                                var lineMatches = line.match(parseLinePattern);
                                if (lineMatches) {
                                    handlerLine  = "at " + lineMatches[1] +
                                        ":" + lineMatches[2] + ":" + lineMatches[3] + " ";
                                }
                                break;
                            }
                        }

                        if (stack.length > 0) {
                            var firstUserLine = stack[0];
                            for (var i = 0; i < traceLines.length; ++i) {

                                if (traceLines[i] === firstUserLine) {
                                    if (i > 0) {
                                        creatorLine = "\n" + traceLines[i - 1];
                                    }
                                    break;
                                }
                            }

                        }
                    }
                    var msg = "a promise was created in a " + name +
                        "handler " + handlerLine + "but was not returned from it, " +
                        "see http://goo.gl/rRqMUw" +
                        creatorLine;
                    promise._warn(msg, true, promiseCreated);
                }
            }

            function deprecated(name, replacement) {
                var message = name +
                    " is deprecated and will be removed in a future version.";
                if (replacement) message += " Use " + replacement + " instead.";
                return warn(message);
            }

            function warn(message, shouldUseOwnTrace, promise) {
                if (!config$$1.warnings) return;
                var warning = new Warning(message);
                var ctx;
                if (shouldUseOwnTrace) {
                    promise._attachExtraTrace(warning);
                } else if (config$$1.longStackTraces && (ctx = Promise._peekContext())) {
                    ctx.attachExtraTrace(warning);
                } else {
                    var parsed = parseStackAndMessage(warning);
                    warning.stack = parsed.message + "\n" + parsed.stack.join("\n");
                }

                if (!activeFireEvent("warning", warning)) {
                    formatAndLogError(warning, "", true);
                }
            }

            function reconstructStack(message, stacks) {
                for (var i = 0; i < stacks.length - 1; ++i) {
                    stacks[i].push("From previous event:");
                    stacks[i] = stacks[i].join("\n");
                }
                if (i < stacks.length) {
                    stacks[i] = stacks[i].join("\n");
                }
                return message + "\n" + stacks.join("\n");
            }

            function removeDuplicateOrEmptyJumps(stacks) {
                for (var i = 0; i < stacks.length; ++i) {
                    if (stacks[i].length === 0 ||
                        ((i + 1 < stacks.length) && stacks[i][0] === stacks[i+1][0])) {
                        stacks.splice(i, 1);
                        i--;
                    }
                }
            }

            function removeCommonRoots(stacks) {
                var current = stacks[0];
                for (var i = 1; i < stacks.length; ++i) {
                    var prev = stacks[i];
                    var currentLastIndex = current.length - 1;
                    var currentLastLine = current[currentLastIndex];
                    var commonRootMeetPoint = -1;

                    for (var j = prev.length - 1; j >= 0; --j) {
                        if (prev[j] === currentLastLine) {
                            commonRootMeetPoint = j;
                            break;
                        }
                    }

                    for (var j = commonRootMeetPoint; j >= 0; --j) {
                        var line = prev[j];
                        if (current[currentLastIndex] === line) {
                            current.pop();
                            currentLastIndex--;
                        } else {
                            break;
                        }
                    }
                    current = prev;
                }
            }

            function cleanStack(stack) {
                var ret = [];
                for (var i = 0; i < stack.length; ++i) {
                    var line = stack[i];
                    var isTraceLine = "    (No stack trace)" === line ||
                        stackFramePattern.test(line);
                    var isInternalFrame = isTraceLine && shouldIgnore(line);
                    if (isTraceLine && !isInternalFrame) {
                        if (indentStackFrames && line.charAt(0) !== " ") {
                            line = "    " + line;
                        }
                        ret.push(line);
                    }
                }
                return ret;
            }

            function stackFramesAsArray(error) {
                var stack = error.stack.replace(/\s+$/g, "").split("\n");
                for (var i = 0; i < stack.length; ++i) {
                    var line = stack[i];
                    if ("    (No stack trace)" === line || stackFramePattern.test(line)) {
                        break;
                    }
                }
                if (i > 0 && error.name != "SyntaxError") {
                    stack = stack.slice(i);
                }
                return stack;
            }

            function parseStackAndMessage(error) {
                var stack = error.stack;
                var message = error.toString();
                stack = typeof stack === "string" && stack.length > 0
                            ? stackFramesAsArray(error) : ["    (No stack trace)"];
                return {
                    message: message,
                    stack: error.name == "SyntaxError" ? stack : cleanStack(stack)
                };
            }

            function formatAndLogError(error, title$$1, isSoft) {
                if (typeof console !== "undefined") {
                    var message;
                    if (util.isObject(error)) {
                        var stack = error.stack;
                        message = title$$1 + formatStack(stack, error);
                    } else {
                        message = title$$1 + String(error);
                    }
                    if (typeof printWarning === "function") {
                        printWarning(message, isSoft);
                    } else if (typeof console.log === "function" ||
                        typeof console.log === "object") {
                        console.log(message);
                    }
                }
            }

            function fireRejectionEvent(name, localHandler, reason, promise) {
                var localEventFired = false;
                try {
                    if (typeof localHandler === "function") {
                        localEventFired = true;
                        if (name === "rejectionHandled") {
                            localHandler(promise);
                        } else {
                            localHandler(reason, promise);
                        }
                    }
                } catch (e) {
                    async.throwLater(e);
                }

                if (name === "unhandledRejection") {
                    if (!activeFireEvent(name, reason, promise) && !localEventFired) {
                        formatAndLogError(reason, "Unhandled rejection ");
                    }
                } else {
                    activeFireEvent(name, promise);
                }
            }

            function formatNonError(obj) {
                var str;
                if (typeof obj === "function") {
                    str = "[function " +
                        (obj.name || "anonymous") +
                        "]";
                } else {
                    str = obj && typeof obj.toString === "function"
                        ? obj.toString() : util.toString(obj);
                    var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
                    if (ruselessToString.test(str)) {
                        try {
                            var newStr = JSON.stringify(obj);
                            str = newStr;
                        }
                        catch(e) {

                        }
                    }
                    if (str.length === 0) {
                        str = "(empty array)";
                    }
                }
                return ("(<" + snip(str) + ">, no stack trace)");
            }

            function snip(str) {
                var maxChars = 41;
                if (str.length < maxChars) {
                    return str;
                }
                return str.substr(0, maxChars - 3) + "...";
            }

            function longStackTracesIsSupported() {
                return typeof captureStackTrace === "function";
            }

            var shouldIgnore = function() { return false; };
            var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
            function parseLineInfo(line) {
                var matches = line.match(parseLineInfoRegex);
                if (matches) {
                    return {
                        fileName: matches[1],
                        line: parseInt(matches[2], 10)
                    };
                }
            }

            function setBounds(firstLineError, lastLineError) {
                if (!longStackTracesIsSupported()) return;
                var firstStackLines = firstLineError.stack.split("\n");
                var lastStackLines = lastLineError.stack.split("\n");
                var firstIndex = -1;
                var lastIndex = -1;
                var firstFileName;
                var lastFileName;
                for (var i = 0; i < firstStackLines.length; ++i) {
                    var result = parseLineInfo(firstStackLines[i]);
                    if (result) {
                        firstFileName = result.fileName;
                        firstIndex = result.line;
                        break;
                    }
                }
                for (var i = 0; i < lastStackLines.length; ++i) {
                    var result = parseLineInfo(lastStackLines[i]);
                    if (result) {
                        lastFileName = result.fileName;
                        lastIndex = result.line;
                        break;
                    }
                }
                if (firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName ||
                    firstFileName !== lastFileName || firstIndex >= lastIndex) {
                    return;
                }

                shouldIgnore = function(line) {
                    if (bluebirdFramePattern.test(line)) return true;
                    var info = parseLineInfo(line);
                    if (info) {
                        if (info.fileName === firstFileName &&
                            (firstIndex <= info.line && info.line <= lastIndex)) {
                            return true;
                        }
                    }
                    return false;
                };
            }

            function CapturedTrace(parent) {
                this._parent = parent;
                this._promisesCreated = 0;
                var length = this._length = 1 + (parent === undefined ? 0 : parent._length);
                captureStackTrace(this, CapturedTrace);
                if (length > 32) this.uncycle();
            }
            util.inherits(CapturedTrace, Error);
            Context.CapturedTrace = CapturedTrace;

            CapturedTrace.prototype.uncycle = function() {
                var length = this._length;
                if (length < 2) return;
                var nodes = [];
                var stackToIndex = {};

                for (var i = 0, node = this; node !== undefined; ++i) {
                    nodes.push(node);
                    node = node._parent;
                }
                length = this._length = i;
                for (var i = length - 1; i >= 0; --i) {
                    var stack = nodes[i].stack;
                    if (stackToIndex[stack] === undefined) {
                        stackToIndex[stack] = i;
                    }
                }
                for (var i = 0; i < length; ++i) {
                    var currentStack = nodes[i].stack;
                    var index = stackToIndex[currentStack];
                    if (index !== undefined && index !== i) {
                        if (index > 0) {
                            nodes[index - 1]._parent = undefined;
                            nodes[index - 1]._length = 1;
                        }
                        nodes[i]._parent = undefined;
                        nodes[i]._length = 1;
                        var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;

                        if (index < length - 1) {
                            cycleEdgeNode._parent = nodes[index + 1];
                            cycleEdgeNode._parent.uncycle();
                            cycleEdgeNode._length =
                                cycleEdgeNode._parent._length + 1;
                        } else {
                            cycleEdgeNode._parent = undefined;
                            cycleEdgeNode._length = 1;
                        }
                        var currentChildLength = cycleEdgeNode._length + 1;
                        for (var j = i - 2; j >= 0; --j) {
                            nodes[j]._length = currentChildLength;
                            currentChildLength++;
                        }
                        return;
                    }
                }
            };

            CapturedTrace.prototype.attachExtraTrace = function(error) {
                if (error.__stackCleaned__) return;
                this.uncycle();
                var parsed = parseStackAndMessage(error);
                var message = parsed.message;
                var stacks = [parsed.stack];

                var trace = this;
                while (trace !== undefined) {
                    stacks.push(cleanStack(trace.stack.split("\n")));
                    trace = trace._parent;
                }
                removeCommonRoots(stacks);
                removeDuplicateOrEmptyJumps(stacks);
                util.notEnumerableProp(error, "stack", reconstructStack(message, stacks));
                util.notEnumerableProp(error, "__stackCleaned__", true);
            };

            var captureStackTrace = (function stackDetection() {
                var v8stackFramePattern = /^\s*at\s*/;
                var v8stackFormatter = function(stack, error) {
                    if (typeof stack === "string") return stack;

                    if (error.name !== undefined &&
                        error.message !== undefined) {
                        return error.toString();
                    }
                    return formatNonError(error);
                };

                if (typeof Error.stackTraceLimit === "number" &&
                    typeof Error.captureStackTrace === "function") {
                    Error.stackTraceLimit += 6;
                    stackFramePattern = v8stackFramePattern;
                    formatStack = v8stackFormatter;
                    var captureStackTrace = Error.captureStackTrace;

                    shouldIgnore = function(line) {
                        return bluebirdFramePattern.test(line);
                    };
                    return function(receiver, ignoreUntil) {
                        Error.stackTraceLimit += 6;
                        captureStackTrace(receiver, ignoreUntil);
                        Error.stackTraceLimit -= 6;
                    };
                }
                var err = new Error();

                if (typeof err.stack === "string" &&
                    err.stack.split("\n")[0].indexOf("stackDetection@") >= 0) {
                    stackFramePattern = /@/;
                    formatStack = v8stackFormatter;
                    indentStackFrames = true;
                    return function captureStackTrace(o) {
                        o.stack = new Error().stack;
                    };
                }

                var hasStackAfterThrow;
                try { throw new Error(); }
                catch(e) {
                    hasStackAfterThrow = ("stack" in e);
                }
                if (!("stack" in err) && hasStackAfterThrow &&
                    typeof Error.stackTraceLimit === "number") {
                    stackFramePattern = v8stackFramePattern;
                    formatStack = v8stackFormatter;
                    return function captureStackTrace(o) {
                        Error.stackTraceLimit += 6;
                        try { throw new Error(); }
                        catch(e) { o.stack = e.stack; }
                        Error.stackTraceLimit -= 6;
                    };
                }

                formatStack = function(stack, error) {
                    if (typeof stack === "string") return stack;

                    if ((typeof error === "object" ||
                        typeof error === "function") &&
                        error.name !== undefined &&
                        error.message !== undefined) {
                        return error.toString();
                    }
                    return formatNonError(error);
                };

                return null;

            })([]);

            if (typeof console !== "undefined" && typeof console.warn !== "undefined") {
                printWarning = function (message) {
                    console.warn(message);
                };
                if (util.isNode && process.stderr.isTTY) {
                    printWarning = function(message, isSoft) {
                        var color = isSoft ? "\u001b[33m" : "\u001b[31m";
                        console.warn(color + message + "\u001b[0m\n");
                    };
                } else if (!util.isNode && typeof (new Error().stack) === "string") {
                    printWarning = function(message, isSoft) {
                        console.warn("%c" + message,
                                    isSoft ? "color: darkorange" : "color: red");
                    };
                }
            }

            var config$$1 = {
                warnings: warnings,
                longStackTraces: false,
                cancellation: false,
                monitoring: false
            };

            if (longStackTraces) Promise.longStackTraces();

            return {
                longStackTraces: function() {
                    return config$$1.longStackTraces;
                },
                warnings: function() {
                    return config$$1.warnings;
                },
                cancellation: function() {
                    return config$$1.cancellation;
                },
                monitoring: function() {
                    return config$$1.monitoring;
                },
                propagateFromFunction: function() {
                    return propagateFromFunction;
                },
                boundValueFunction: function() {
                    return boundValueFunction;
                },
                checkForgottenReturns: checkForgottenReturns,
                setBounds: setBounds,
                warn: warn,
                deprecated: deprecated,
                CapturedTrace: CapturedTrace,
                fireDomEvent: fireDomEvent,
                fireGlobalEvent: fireGlobalEvent
            };
            };

            },{"./errors":12,"./es5":13,"./util":36}],10:[function(_dereq_,module,exports){
            module.exports = function(Promise) {
            function returner() {
                return this.value;
            }
            function thrower() {
                throw this.reason;
            }

            Promise.prototype["return"] =
            Promise.prototype.thenReturn = function (value) {
                if (value instanceof Promise) value.suppressUnhandledRejections();
                return this._then(
                    returner, undefined, undefined, {value: value}, undefined);
            };

            Promise.prototype["throw"] =
            Promise.prototype.thenThrow = function (reason) {
                return this._then(
                    thrower, undefined, undefined, {reason: reason}, undefined);
            };

            Promise.prototype.catchThrow = function (reason) {
                if (arguments.length <= 1) {
                    return this._then(
                        undefined, thrower, undefined, {reason: reason}, undefined);
                } else {
                    var _reason = arguments[1];
                    var handler = function() {throw _reason;};
                    return this.caught(reason, handler);
                }
            };

            Promise.prototype.catchReturn = function (value) {
                if (arguments.length <= 1) {
                    if (value instanceof Promise) value.suppressUnhandledRejections();
                    return this._then(
                        undefined, returner, undefined, {value: value}, undefined);
                } else {
                    var _value = arguments[1];
                    if (_value instanceof Promise) _value.suppressUnhandledRejections();
                    var handler = function() {return _value;};
                    return this.caught(value, handler);
                }
            };
            };

            },{}],11:[function(_dereq_,module,exports){
            module.exports = function(Promise, INTERNAL) {
            var PromiseReduce = Promise.reduce;
            var PromiseAll = Promise.all;

            function promiseAllThis() {
                return PromiseAll(this);
            }

            function PromiseMapSeries(promises, fn) {
                return PromiseReduce(promises, fn, INTERNAL, INTERNAL);
            }

            Promise.prototype.each = function (fn) {
                return PromiseReduce(this, fn, INTERNAL, 0)
                          ._then(promiseAllThis, undefined, undefined, this, undefined);
            };

            Promise.prototype.mapSeries = function (fn) {
                return PromiseReduce(this, fn, INTERNAL, INTERNAL);
            };

            Promise.each = function (promises, fn) {
                return PromiseReduce(promises, fn, INTERNAL, 0)
                          ._then(promiseAllThis, undefined, undefined, promises, undefined);
            };

            Promise.mapSeries = PromiseMapSeries;
            };


            },{}],12:[function(_dereq_,module,exports){
            var es5 = _dereq_("./es5");
            var Objectfreeze = es5.freeze;
            var util = _dereq_("./util");
            var inherits = util.inherits;
            var notEnumerableProp = util.notEnumerableProp;

            function subError(nameProperty, defaultMessage) {
                function SubError(message) {
                    if (!(this instanceof SubError)) return new SubError(message);
                    notEnumerableProp(this, "message",
                        typeof message === "string" ? message : defaultMessage);
                    notEnumerableProp(this, "name", nameProperty);
                    if (Error.captureStackTrace) {
                        Error.captureStackTrace(this, this.constructor);
                    } else {
                        Error.call(this);
                    }
                }
                inherits(SubError, Error);
                return SubError;
            }

            var _TypeError, _RangeError;
            var Warning = subError("Warning", "warning");
            var CancellationError = subError("CancellationError", "cancellation error");
            var TimeoutError = subError("TimeoutError", "timeout error");
            var AggregateError = subError("AggregateError", "aggregate error");
            try {
                _TypeError = TypeError;
                _RangeError = RangeError;
            } catch(e) {
                _TypeError = subError("TypeError", "type error");
                _RangeError = subError("RangeError", "range error");
            }

            var methods = ("join pop push shift unshift slice filter forEach some " +
                "every map indexOf lastIndexOf reduce reduceRight sort reverse").split(" ");

            for (var i = 0; i < methods.length; ++i) {
                if (typeof Array.prototype[methods[i]] === "function") {
                    AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
                }
            }

            es5.defineProperty(AggregateError.prototype, "length", {
                value: 0,
                configurable: false,
                writable: true,
                enumerable: true
            });
            AggregateError.prototype["isOperational"] = true;
            var level = 0;
            AggregateError.prototype.toString = function() {
                var indent = Array(level * 4 + 1).join(" ");
                var ret = "\n" + indent + "AggregateError of:" + "\n";
                level++;
                indent = Array(level * 4 + 1).join(" ");
                for (var i = 0; i < this.length; ++i) {
                    var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
                    var lines = str.split("\n");
                    for (var j = 0; j < lines.length; ++j) {
                        lines[j] = indent + lines[j];
                    }
                    str = lines.join("\n");
                    ret += str + "\n";
                }
                level--;
                return ret;
            };

            function OperationalError(message) {
                if (!(this instanceof OperationalError))
                    return new OperationalError(message);
                notEnumerableProp(this, "name", "OperationalError");
                notEnumerableProp(this, "message", message);
                this.cause = message;
                this["isOperational"] = true;

                if (message instanceof Error) {
                    notEnumerableProp(this, "message", message.message);
                    notEnumerableProp(this, "stack", message.stack);
                } else if (Error.captureStackTrace) {
                    Error.captureStackTrace(this, this.constructor);
                }

            }
            inherits(OperationalError, Error);

            var errorTypes = Error["__BluebirdErrorTypes__"];
            if (!errorTypes) {
                errorTypes = Objectfreeze({
                    CancellationError: CancellationError,
                    TimeoutError: TimeoutError,
                    OperationalError: OperationalError,
                    RejectionError: OperationalError,
                    AggregateError: AggregateError
                });
                es5.defineProperty(Error, "__BluebirdErrorTypes__", {
                    value: errorTypes,
                    writable: false,
                    enumerable: false,
                    configurable: false
                });
            }

            module.exports = {
                Error: Error,
                TypeError: _TypeError,
                RangeError: _RangeError,
                CancellationError: errorTypes.CancellationError,
                OperationalError: errorTypes.OperationalError,
                TimeoutError: errorTypes.TimeoutError,
                AggregateError: errorTypes.AggregateError,
                Warning: Warning
            };

            },{"./es5":13,"./util":36}],13:[function(_dereq_,module,exports){
            var isES5 = (function(){
                return this === undefined;
            })();

            if (isES5) {
                module.exports = {
                    freeze: Object.freeze,
                    defineProperty: Object.defineProperty,
                    getDescriptor: Object.getOwnPropertyDescriptor,
                    keys: Object.keys,
                    names: Object.getOwnPropertyNames,
                    getPrototypeOf: Object.getPrototypeOf,
                    isArray: Array.isArray,
                    isES5: isES5,
                    propertyIsWritable: function(obj, prop) {
                        var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
                        return !!(!descriptor || descriptor.writable || descriptor.set);
                    }
                };
            } else {
                var has = {}.hasOwnProperty;
                var str = {}.toString;
                var proto = {}.constructor.prototype;

                var ObjectKeys = function (o) {
                    var ret = [];
                    for (var key in o) {
                        if (has.call(o, key)) {
                            ret.push(key);
                        }
                    }
                    return ret;
                };

                var ObjectGetDescriptor = function(o, key) {
                    return {value: o[key]};
                };

                var ObjectDefineProperty = function (o, key, desc) {
                    o[key] = desc.value;
                    return o;
                };

                var ObjectFreeze = function (obj) {
                    return obj;
                };

                var ObjectGetPrototypeOf = function (obj) {
                    try {
                        return Object(obj).constructor.prototype;
                    }
                    catch (e) {
                        return proto;
                    }
                };

                var ArrayIsArray = function (obj) {
                    try {
                        return str.call(obj) === "[object Array]";
                    }
                    catch(e) {
                        return false;
                    }
                };

                module.exports = {
                    isArray: ArrayIsArray,
                    keys: ObjectKeys,
                    names: ObjectKeys,
                    defineProperty: ObjectDefineProperty,
                    getDescriptor: ObjectGetDescriptor,
                    freeze: ObjectFreeze,
                    getPrototypeOf: ObjectGetPrototypeOf,
                    isES5: isES5,
                    propertyIsWritable: function() {
                        return true;
                    }
                };
            }

            },{}],14:[function(_dereq_,module,exports){
            module.exports = function(Promise, INTERNAL) {
            var PromiseMap = Promise.map;

            Promise.prototype.filter = function (fn, options) {
                return PromiseMap(this, fn, options, INTERNAL);
            };

            Promise.filter = function (promises, fn, options) {
                return PromiseMap(promises, fn, options, INTERNAL);
            };
            };

            },{}],15:[function(_dereq_,module,exports){
            module.exports = function(Promise, tryConvertToPromise, NEXT_FILTER) {
            var util = _dereq_("./util");
            var CancellationError = Promise.CancellationError;
            var errorObj = util.errorObj;
            var catchFilter = _dereq_("./catch_filter")(NEXT_FILTER);

            function PassThroughHandlerContext(promise, type, handler) {
                this.promise = promise;
                this.type = type;
                this.handler = handler;
                this.called = false;
                this.cancelPromise = null;
            }

            PassThroughHandlerContext.prototype.isFinallyHandler = function() {
                return this.type === 0;
            };

            function FinallyHandlerCancelReaction(finallyHandler) {
                this.finallyHandler = finallyHandler;
            }

            FinallyHandlerCancelReaction.prototype._resultCancelled = function() {
                checkCancel(this.finallyHandler);
            };

            function checkCancel(ctx, reason) {
                if (ctx.cancelPromise != null) {
                    if (arguments.length > 1) {
                        ctx.cancelPromise._reject(reason);
                    } else {
                        ctx.cancelPromise._cancel();
                    }
                    ctx.cancelPromise = null;
                    return true;
                }
                return false;
            }

            function succeed() {
                return finallyHandler.call(this, this.promise._target()._settledValue());
            }
            function fail(reason) {
                if (checkCancel(this, reason)) return;
                errorObj.e = reason;
                return errorObj;
            }
            function finallyHandler(reasonOrValue) {
                var promise = this.promise;
                var handler = this.handler;

                if (!this.called) {
                    this.called = true;
                    var ret = this.isFinallyHandler()
                        ? handler.call(promise._boundValue())
                        : handler.call(promise._boundValue(), reasonOrValue);
                    if (ret === NEXT_FILTER) {
                        return ret;
                    } else if (ret !== undefined) {
                        promise._setReturnedNonUndefined();
                        var maybePromise = tryConvertToPromise(ret, promise);
                        if (maybePromise instanceof Promise) {
                            if (this.cancelPromise != null) {
                                if (maybePromise._isCancelled()) {
                                    var reason =
                                        new CancellationError("late cancellation observer");
                                    promise._attachExtraTrace(reason);
                                    errorObj.e = reason;
                                    return errorObj;
                                } else if (maybePromise.isPending()) {
                                    maybePromise._attachCancellationCallback(
                                        new FinallyHandlerCancelReaction(this));
                                }
                            }
                            return maybePromise._then(
                                succeed, fail, undefined, this, undefined);
                        }
                    }
                }

                if (promise.isRejected()) {
                    checkCancel(this);
                    errorObj.e = reasonOrValue;
                    return errorObj;
                } else {
                    checkCancel(this);
                    return reasonOrValue;
                }
            }

            Promise.prototype._passThrough = function(handler, type, success, fail) {
                if (typeof handler !== "function") return this.then();
                return this._then(success,
                                  fail,
                                  undefined,
                                  new PassThroughHandlerContext(this, type, handler),
                                  undefined);
            };

            Promise.prototype.lastly =
            Promise.prototype["finally"] = function (handler) {
                return this._passThrough(handler,
                                         0,
                                         finallyHandler,
                                         finallyHandler);
            };


            Promise.prototype.tap = function (handler) {
                return this._passThrough(handler, 1, finallyHandler);
            };

            Promise.prototype.tapCatch = function (handlerOrPredicate) {
                var len = arguments.length;
                if(len === 1) {
                    return this._passThrough(handlerOrPredicate,
                                             1,
                                             undefined,
                                             finallyHandler);
                } else {
                     var catchInstances = new Array(len - 1),
                        j = 0, i;
                    for (i = 0; i < len - 1; ++i) {
                        var item = arguments[i];
                        if (util.isObject(item)) {
                            catchInstances[j++] = item;
                        } else {
                            return Promise.reject(new TypeError(
                                "tapCatch statement predicate: "
                                + "expecting an object but got " + util.classString(item)
                            ));
                        }
                    }
                    catchInstances.length = j;
                    var handler = arguments[i];
                    return this._passThrough(catchFilter(catchInstances, handler, this),
                                             1,
                                             undefined,
                                             finallyHandler);
                }

            };

            return PassThroughHandlerContext;
            };

            },{"./catch_filter":7,"./util":36}],16:[function(_dereq_,module,exports){
            module.exports = function(Promise,
                                      apiRejection,
                                      INTERNAL,
                                      tryConvertToPromise,
                                      Proxyable,
                                      debug) {
            var errors = _dereq_("./errors");
            var TypeError = errors.TypeError;
            var util = _dereq_("./util");
            var errorObj = util.errorObj;
            var tryCatch = util.tryCatch;
            var yieldHandlers = [];

            function promiseFromYieldHandler(value, yieldHandlers, traceParent) {
                for (var i = 0; i < yieldHandlers.length; ++i) {
                    traceParent._pushContext();
                    var result = tryCatch(yieldHandlers[i])(value);
                    traceParent._popContext();
                    if (result === errorObj) {
                        traceParent._pushContext();
                        var ret = Promise.reject(errorObj.e);
                        traceParent._popContext();
                        return ret;
                    }
                    var maybePromise = tryConvertToPromise(result, traceParent);
                    if (maybePromise instanceof Promise) return maybePromise;
                }
                return null;
            }

            function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
                if (debug.cancellation()) {
                    var internal = new Promise(INTERNAL);
                    var _finallyPromise = this._finallyPromise = new Promise(INTERNAL);
                    this._promise = internal.lastly(function() {
                        return _finallyPromise;
                    });
                    internal._captureStackTrace();
                    internal._setOnCancel(this);
                } else {
                    var promise = this._promise = new Promise(INTERNAL);
                    promise._captureStackTrace();
                }
                this._stack = stack;
                this._generatorFunction = generatorFunction;
                this._receiver = receiver;
                this._generator = undefined;
                this._yieldHandlers = typeof yieldHandler === "function"
                    ? [yieldHandler].concat(yieldHandlers)
                    : yieldHandlers;
                this._yieldedPromise = null;
                this._cancellationPhase = false;
            }
            util.inherits(PromiseSpawn, Proxyable);

            PromiseSpawn.prototype._isResolved = function() {
                return this._promise === null;
            };

            PromiseSpawn.prototype._cleanup = function() {
                this._promise = this._generator = null;
                if (debug.cancellation() && this._finallyPromise !== null) {
                    this._finallyPromise._fulfill();
                    this._finallyPromise = null;
                }
            };

            PromiseSpawn.prototype._promiseCancelled = function() {
                if (this._isResolved()) return;
                var implementsReturn = typeof this._generator["return"] !== "undefined";

                var result;
                if (!implementsReturn) {
                    var reason = new Promise.CancellationError(
                        "generator .return() sentinel");
                    Promise.coroutine.returnSentinel = reason;
                    this._promise._attachExtraTrace(reason);
                    this._promise._pushContext();
                    result = tryCatch(this._generator["throw"]).call(this._generator,
                                                                     reason);
                    this._promise._popContext();
                } else {
                    this._promise._pushContext();
                    result = tryCatch(this._generator["return"]).call(this._generator,
                                                                      undefined);
                    this._promise._popContext();
                }
                this._cancellationPhase = true;
                this._yieldedPromise = null;
                this._continue(result);
            };

            PromiseSpawn.prototype._promiseFulfilled = function(value) {
                this._yieldedPromise = null;
                this._promise._pushContext();
                var result = tryCatch(this._generator.next).call(this._generator, value);
                this._promise._popContext();
                this._continue(result);
            };

            PromiseSpawn.prototype._promiseRejected = function(reason) {
                this._yieldedPromise = null;
                this._promise._attachExtraTrace(reason);
                this._promise._pushContext();
                var result = tryCatch(this._generator["throw"])
                    .call(this._generator, reason);
                this._promise._popContext();
                this._continue(result);
            };

            PromiseSpawn.prototype._resultCancelled = function() {
                if (this._yieldedPromise instanceof Promise) {
                    var promise = this._yieldedPromise;
                    this._yieldedPromise = null;
                    promise.cancel();
                }
            };

            PromiseSpawn.prototype.promise = function () {
                return this._promise;
            };

            PromiseSpawn.prototype._run = function () {
                this._generator = this._generatorFunction.call(this._receiver);
                this._receiver =
                    this._generatorFunction = undefined;
                this._promiseFulfilled(undefined);
            };

            PromiseSpawn.prototype._continue = function (result) {
                var promise = this._promise;
                if (result === errorObj) {
                    this._cleanup();
                    if (this._cancellationPhase) {
                        return promise.cancel();
                    } else {
                        return promise._rejectCallback(result.e, false);
                    }
                }

                var value = result.value;
                if (result.done === true) {
                    this._cleanup();
                    if (this._cancellationPhase) {
                        return promise.cancel();
                    } else {
                        return promise._resolveCallback(value);
                    }
                } else {
                    var maybePromise = tryConvertToPromise(value, this._promise);
                    if (!(maybePromise instanceof Promise)) {
                        maybePromise =
                            promiseFromYieldHandler(maybePromise,
                                                    this._yieldHandlers,
                                                    this._promise);
                        if (maybePromise === null) {
                            this._promiseRejected(
                                new TypeError(
                                    "A value %s was yielded that could not be treated as a promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a\u000a".replace("%s", String(value)) +
                                    "From coroutine:\u000a" +
                                    this._stack.split("\n").slice(1, -7).join("\n")
                                )
                            );
                            return;
                        }
                    }
                    maybePromise = maybePromise._target();
                    var bitField = maybePromise._bitField;
                    if (((bitField & 50397184) === 0)) {
                        this._yieldedPromise = maybePromise;
                        maybePromise._proxy(this, null);
                    } else if (((bitField & 33554432) !== 0)) {
                        Promise._async.invoke(
                            this._promiseFulfilled, this, maybePromise._value()
                        );
                    } else if (((bitField & 16777216) !== 0)) {
                        Promise._async.invoke(
                            this._promiseRejected, this, maybePromise._reason()
                        );
                    } else {
                        this._promiseCancelled();
                    }
                }
            };

            Promise.coroutine = function (generatorFunction, options) {
                if (typeof generatorFunction !== "function") {
                    throw new TypeError("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
                }
                var yieldHandler = Object(options).yieldHandler;
                var PromiseSpawn$ = PromiseSpawn;
                var stack = new Error().stack;
                return function () {
                    var generator = generatorFunction.apply(this, arguments);
                    var spawn = new PromiseSpawn$(undefined, undefined, yieldHandler,
                                                  stack);
                    var ret = spawn.promise();
                    spawn._generator = generator;
                    spawn._promiseFulfilled(undefined);
                    return ret;
                };
            };

            Promise.coroutine.addYieldHandler = function(fn) {
                if (typeof fn !== "function") {
                    throw new TypeError("expecting a function but got " + util.classString(fn));
                }
                yieldHandlers.push(fn);
            };

            Promise.spawn = function (generatorFunction) {
                debug.deprecated("Promise.spawn()", "Promise.coroutine()");
                if (typeof generatorFunction !== "function") {
                    return apiRejection("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
                }
                var spawn = new PromiseSpawn(generatorFunction, this);
                var ret = spawn.promise();
                spawn._run(Promise.spawn);
                return ret;
            };
            };

            },{"./errors":12,"./util":36}],17:[function(_dereq_,module,exports){
            module.exports =
            function(Promise, PromiseArray, tryConvertToPromise, INTERNAL, async,
                     getDomain) {
            var util = _dereq_("./util");
            var canEvaluate = util.canEvaluate;
            var tryCatch = util.tryCatch;
            var errorObj = util.errorObj;

            Promise.join = function () {
                var last = arguments.length - 1;
                var fn;
                if (last > 0 && typeof arguments[last] === "function") {
                    fn = arguments[last];
                    if (false) {
                        {
                            var ret = new Promise(INTERNAL);
                        }
                    }
                }
                var args = [].slice.call(arguments);    if (fn) args.pop();
                var ret = new PromiseArray(args).promise();
                return fn !== undefined ? ret.spread(fn) : ret;
            };

            };

            },{"./util":36}],18:[function(_dereq_,module,exports){
            module.exports = function(Promise,
                                      PromiseArray,
                                      apiRejection,
                                      tryConvertToPromise,
                                      INTERNAL,
                                      debug) {
            var getDomain = Promise._getDomain;
            var util = _dereq_("./util");
            var tryCatch = util.tryCatch;
            var errorObj = util.errorObj;
            var async = Promise._async;

            function MappingPromiseArray(promises, fn, limit, _filter) {
                this.constructor$(promises);
                this._promise._captureStackTrace();
                var domain = getDomain();
                this._callback = domain === null ? fn : util.domainBind(domain, fn);
                this._preservedValues = _filter === INTERNAL
                    ? new Array(this.length())
                    : null;
                this._limit = limit;
                this._inFlight = 0;
                this._queue = [];
                async.invoke(this._asyncInit, this, undefined);
            }
            util.inherits(MappingPromiseArray, PromiseArray);

            MappingPromiseArray.prototype._asyncInit = function() {
                this._init$(undefined, -2);
            };

            MappingPromiseArray.prototype._init = function () {};

            MappingPromiseArray.prototype._promiseFulfilled = function (value, index) {
                var values = this._values;
                var length = this.length();
                var preservedValues = this._preservedValues;
                var limit = this._limit;

                if (index < 0) {
                    index = (index * -1) - 1;
                    values[index] = value;
                    if (limit >= 1) {
                        this._inFlight--;
                        this._drainQueue();
                        if (this._isResolved()) return true;
                    }
                } else {
                    if (limit >= 1 && this._inFlight >= limit) {
                        values[index] = value;
                        this._queue.push(index);
                        return false;
                    }
                    if (preservedValues !== null) preservedValues[index] = value;

                    var promise = this._promise;
                    var callback = this._callback;
                    var receiver = promise._boundValue();
                    promise._pushContext();
                    var ret = tryCatch(callback).call(receiver, value, index, length);
                    var promiseCreated = promise._popContext();
                    debug.checkForgottenReturns(
                        ret,
                        promiseCreated,
                        preservedValues !== null ? "Promise.filter" : "Promise.map",
                        promise
                    );
                    if (ret === errorObj) {
                        this._reject(ret.e);
                        return true;
                    }

                    var maybePromise = tryConvertToPromise(ret, this._promise);
                    if (maybePromise instanceof Promise) {
                        maybePromise = maybePromise._target();
                        var bitField = maybePromise._bitField;
                        if (((bitField & 50397184) === 0)) {
                            if (limit >= 1) this._inFlight++;
                            values[index] = maybePromise;
                            maybePromise._proxy(this, (index + 1) * -1);
                            return false;
                        } else if (((bitField & 33554432) !== 0)) {
                            ret = maybePromise._value();
                        } else if (((bitField & 16777216) !== 0)) {
                            this._reject(maybePromise._reason());
                            return true;
                        } else {
                            this._cancel();
                            return true;
                        }
                    }
                    values[index] = ret;
                }
                var totalResolved = ++this._totalResolved;
                if (totalResolved >= length) {
                    if (preservedValues !== null) {
                        this._filter(values, preservedValues);
                    } else {
                        this._resolve(values);
                    }
                    return true;
                }
                return false;
            };

            MappingPromiseArray.prototype._drainQueue = function () {
                var queue = this._queue;
                var limit = this._limit;
                var values = this._values;
                while (queue.length > 0 && this._inFlight < limit) {
                    if (this._isResolved()) return;
                    var index = queue.pop();
                    this._promiseFulfilled(values[index], index);
                }
            };

            MappingPromiseArray.prototype._filter = function (booleans, values) {
                var len = values.length;
                var ret = new Array(len);
                var j = 0;
                for (var i = 0; i < len; ++i) {
                    if (booleans[i]) ret[j++] = values[i];
                }
                ret.length = j;
                this._resolve(ret);
            };

            MappingPromiseArray.prototype.preservedValues = function () {
                return this._preservedValues;
            };

            function map(promises, fn, options, _filter) {
                if (typeof fn !== "function") {
                    return apiRejection("expecting a function but got " + util.classString(fn));
                }

                var limit = 0;
                if (options !== undefined) {
                    if (typeof options === "object" && options !== null) {
                        if (typeof options.concurrency !== "number") {
                            return Promise.reject(
                                new TypeError("'concurrency' must be a number but it is " +
                                                util.classString(options.concurrency)));
                        }
                        limit = options.concurrency;
                    } else {
                        return Promise.reject(new TypeError(
                                        "options argument must be an object but it is " +
                                         util.classString(options)));
                    }
                }
                limit = typeof limit === "number" &&
                    isFinite(limit) && limit >= 1 ? limit : 0;
                return new MappingPromiseArray(promises, fn, limit, _filter).promise();
            }

            Promise.prototype.map = function (fn, options) {
                return map(this, fn, options, null);
            };

            Promise.map = function (promises, fn, options, _filter) {
                return map(promises, fn, options, _filter);
            };


            };

            },{"./util":36}],19:[function(_dereq_,module,exports){
            module.exports =
            function(Promise, INTERNAL, tryConvertToPromise, apiRejection, debug) {
            var util = _dereq_("./util");
            var tryCatch = util.tryCatch;

            Promise.method = function (fn) {
                if (typeof fn !== "function") {
                    throw new Promise.TypeError("expecting a function but got " + util.classString(fn));
                }
                return function () {
                    var ret = new Promise(INTERNAL);
                    ret._captureStackTrace();
                    ret._pushContext();
                    var value = tryCatch(fn).apply(this, arguments);
                    var promiseCreated = ret._popContext();
                    debug.checkForgottenReturns(
                        value, promiseCreated, "Promise.method", ret);
                    ret._resolveFromSyncValue(value);
                    return ret;
                };
            };

            Promise.attempt = Promise["try"] = function (fn) {
                if (typeof fn !== "function") {
                    return apiRejection("expecting a function but got " + util.classString(fn));
                }
                var ret = new Promise(INTERNAL);
                ret._captureStackTrace();
                ret._pushContext();
                var value;
                if (arguments.length > 1) {
                    debug.deprecated("calling Promise.try with more than 1 argument");
                    var arg = arguments[1];
                    var ctx = arguments[2];
                    value = util.isArray(arg) ? tryCatch(fn).apply(ctx, arg)
                                              : tryCatch(fn).call(ctx, arg);
                } else {
                    value = tryCatch(fn)();
                }
                var promiseCreated = ret._popContext();
                debug.checkForgottenReturns(
                    value, promiseCreated, "Promise.try", ret);
                ret._resolveFromSyncValue(value);
                return ret;
            };

            Promise.prototype._resolveFromSyncValue = function (value) {
                if (value === util.errorObj) {
                    this._rejectCallback(value.e, false);
                } else {
                    this._resolveCallback(value, true);
                }
            };
            };

            },{"./util":36}],20:[function(_dereq_,module,exports){
            var util = _dereq_("./util");
            var maybeWrapAsError = util.maybeWrapAsError;
            var errors = _dereq_("./errors");
            var OperationalError = errors.OperationalError;
            var es5 = _dereq_("./es5");

            function isUntypedError(obj) {
                return obj instanceof Error &&
                    es5.getPrototypeOf(obj) === Error.prototype;
            }

            var rErrorKey = /^(?:name|message|stack|cause)$/;
            function wrapAsOperationalError(obj) {
                var ret;
                if (isUntypedError(obj)) {
                    ret = new OperationalError(obj);
                    ret.name = obj.name;
                    ret.message = obj.message;
                    ret.stack = obj.stack;
                    var keys = es5.keys(obj);
                    for (var i = 0; i < keys.length; ++i) {
                        var key = keys[i];
                        if (!rErrorKey.test(key)) {
                            ret[key] = obj[key];
                        }
                    }
                    return ret;
                }
                util.markAsOriginatingFromRejection(obj);
                return obj;
            }

            function nodebackForPromise(promise, multiArgs) {
                return function(err, value) {
                    if (promise === null) return;
                    if (err) {
                        var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
                        promise._attachExtraTrace(wrapped);
                        promise._reject(wrapped);
                    } else if (!multiArgs) {
                        promise._fulfill(value);
                    } else {
                        var args = [].slice.call(arguments, 1);            promise._fulfill(args);
                    }
                    promise = null;
                };
            }

            module.exports = nodebackForPromise;

            },{"./errors":12,"./es5":13,"./util":36}],21:[function(_dereq_,module,exports){
            module.exports = function(Promise) {
            var util = _dereq_("./util");
            var async = Promise._async;
            var tryCatch = util.tryCatch;
            var errorObj = util.errorObj;

            function spreadAdapter(val, nodeback) {
                var promise = this;
                if (!util.isArray(val)) return successAdapter.call(promise, val, nodeback);
                var ret =
                    tryCatch(nodeback).apply(promise._boundValue(), [null].concat(val));
                if (ret === errorObj) {
                    async.throwLater(ret.e);
                }
            }

            function successAdapter(val, nodeback) {
                var promise = this;
                var receiver = promise._boundValue();
                var ret = val === undefined
                    ? tryCatch(nodeback).call(receiver, null)
                    : tryCatch(nodeback).call(receiver, null, val);
                if (ret === errorObj) {
                    async.throwLater(ret.e);
                }
            }
            function errorAdapter(reason, nodeback) {
                var promise = this;
                if (!reason) {
                    var newReason = new Error(reason + "");
                    newReason.cause = reason;
                    reason = newReason;
                }
                var ret = tryCatch(nodeback).call(promise._boundValue(), reason);
                if (ret === errorObj) {
                    async.throwLater(ret.e);
                }
            }

            Promise.prototype.asCallback = Promise.prototype.nodeify = function (nodeback,
                                                                                 options) {
                if (typeof nodeback == "function") {
                    var adapter = successAdapter;
                    if (options !== undefined && Object(options).spread) {
                        adapter = spreadAdapter;
                    }
                    this._then(
                        adapter,
                        errorAdapter,
                        undefined,
                        this,
                        nodeback
                    );
                }
                return this;
            };
            };

            },{"./util":36}],22:[function(_dereq_,module,exports){
            module.exports = function() {
            var makeSelfResolutionError = function () {
                return new TypeError("circular promise resolution chain\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
            };
            var reflectHandler = function() {
                return new Promise.PromiseInspection(this._target());
            };
            var apiRejection = function(msg) {
                return Promise.reject(new TypeError(msg));
            };
            function Proxyable() {}
            var UNDEFINED_BINDING = {};
            var util = _dereq_("./util");

            var getDomain;
            if (util.isNode) {
                getDomain = function() {
                    var ret = process.domain;
                    if (ret === undefined) ret = null;
                    return ret;
                };
            } else {
                getDomain = function() {
                    return null;
                };
            }
            util.notEnumerableProp(Promise, "_getDomain", getDomain);

            var es5 = _dereq_("./es5");
            var Async = _dereq_("./async");
            var async = new Async();
            es5.defineProperty(Promise, "_async", {value: async});
            var errors = _dereq_("./errors");
            var TypeError = Promise.TypeError = errors.TypeError;
            Promise.RangeError = errors.RangeError;
            var CancellationError = Promise.CancellationError = errors.CancellationError;
            Promise.TimeoutError = errors.TimeoutError;
            Promise.OperationalError = errors.OperationalError;
            Promise.RejectionError = errors.OperationalError;
            Promise.AggregateError = errors.AggregateError;
            var INTERNAL = function(){};
            var APPLY = {};
            var NEXT_FILTER = {};
            var tryConvertToPromise = _dereq_("./thenables")(Promise, INTERNAL);
            var PromiseArray =
                _dereq_("./promise_array")(Promise, INTERNAL,
                                           tryConvertToPromise, apiRejection, Proxyable);
            var Context = _dereq_("./context")(Promise);
             /*jshint unused:false*/
            var createContext = Context.create;
            var debug = _dereq_("./debuggability")(Promise, Context);
            var CapturedTrace = debug.CapturedTrace;
            var PassThroughHandlerContext =
                _dereq_("./finally")(Promise, tryConvertToPromise, NEXT_FILTER);
            var catchFilter = _dereq_("./catch_filter")(NEXT_FILTER);
            var nodebackForPromise = _dereq_("./nodeback");
            var errorObj = util.errorObj;
            var tryCatch = util.tryCatch;
            function check(self, executor) {
                if (self == null || self.constructor !== Promise) {
                    throw new TypeError("the promise constructor cannot be invoked directly\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
                }
                if (typeof executor !== "function") {
                    throw new TypeError("expecting a function but got " + util.classString(executor));
                }

            }

            function Promise(executor) {
                if (executor !== INTERNAL) {
                    check(this, executor);
                }
                this._bitField = 0;
                this._fulfillmentHandler0 = undefined;
                this._rejectionHandler0 = undefined;
                this._promise0 = undefined;
                this._receiver0 = undefined;
                this._resolveFromExecutor(executor);
                this._promiseCreated();
                this._fireEvent("promiseCreated", this);
            }

            Promise.prototype.toString = function () {
                return "[object Promise]";
            };

            Promise.prototype.caught = Promise.prototype["catch"] = function (fn) {
                var len = arguments.length;
                if (len > 1) {
                    var catchInstances = new Array(len - 1),
                        j = 0, i;
                    for (i = 0; i < len - 1; ++i) {
                        var item = arguments[i];
                        if (util.isObject(item)) {
                            catchInstances[j++] = item;
                        } else {
                            return apiRejection("Catch statement predicate: " +
                                "expecting an object but got " + util.classString(item));
                        }
                    }
                    catchInstances.length = j;
                    fn = arguments[i];
                    return this.then(undefined, catchFilter(catchInstances, fn, this));
                }
                return this.then(undefined, fn);
            };

            Promise.prototype.reflect = function () {
                return this._then(reflectHandler,
                    reflectHandler, undefined, this, undefined);
            };

            Promise.prototype.then = function (didFulfill, didReject) {
                if (debug.warnings() && arguments.length > 0 &&
                    typeof didFulfill !== "function" &&
                    typeof didReject !== "function") {
                    var msg = ".then() only accepts functions but was passed: " +
                            util.classString(didFulfill);
                    if (arguments.length > 1) {
                        msg += ", " + util.classString(didReject);
                    }
                    this._warn(msg);
                }
                return this._then(didFulfill, didReject, undefined, undefined, undefined);
            };

            Promise.prototype.done = function (didFulfill, didReject) {
                var promise =
                    this._then(didFulfill, didReject, undefined, undefined, undefined);
                promise._setIsFinal();
            };

            Promise.prototype.spread = function (fn) {
                if (typeof fn !== "function") {
                    return apiRejection("expecting a function but got " + util.classString(fn));
                }
                return this.all()._then(fn, undefined, undefined, APPLY, undefined);
            };

            Promise.prototype.toJSON = function () {
                var ret = {
                    isFulfilled: false,
                    isRejected: false,
                    fulfillmentValue: undefined,
                    rejectionReason: undefined
                };
                if (this.isFulfilled()) {
                    ret.fulfillmentValue = this.value();
                    ret.isFulfilled = true;
                } else if (this.isRejected()) {
                    ret.rejectionReason = this.reason();
                    ret.isRejected = true;
                }
                return ret;
            };

            Promise.prototype.all = function () {
                if (arguments.length > 0) {
                    this._warn(".all() was passed arguments but it does not take any");
                }
                return new PromiseArray(this).promise();
            };

            Promise.prototype.error = function (fn) {
                return this.caught(util.originatesFromRejection, fn);
            };

            Promise.getNewLibraryCopy = module.exports;

            Promise.is = function (val) {
                return val instanceof Promise;
            };

            Promise.fromNode = Promise.fromCallback = function(fn) {
                var ret = new Promise(INTERNAL);
                ret._captureStackTrace();
                var multiArgs = arguments.length > 1 ? !!Object(arguments[1]).multiArgs
                                                     : false;
                var result = tryCatch(fn)(nodebackForPromise(ret, multiArgs));
                if (result === errorObj) {
                    ret._rejectCallback(result.e, true);
                }
                if (!ret._isFateSealed()) ret._setAsyncGuaranteed();
                return ret;
            };

            Promise.all = function (promises) {
                return new PromiseArray(promises).promise();
            };

            Promise.cast = function (obj) {
                var ret = tryConvertToPromise(obj);
                if (!(ret instanceof Promise)) {
                    ret = new Promise(INTERNAL);
                    ret._captureStackTrace();
                    ret._setFulfilled();
                    ret._rejectionHandler0 = obj;
                }
                return ret;
            };

            Promise.resolve = Promise.fulfilled = Promise.cast;

            Promise.reject = Promise.rejected = function (reason) {
                var ret = new Promise(INTERNAL);
                ret._captureStackTrace();
                ret._rejectCallback(reason, true);
                return ret;
            };

            Promise.setScheduler = function(fn) {
                if (typeof fn !== "function") {
                    throw new TypeError("expecting a function but got " + util.classString(fn));
                }
                return async.setScheduler(fn);
            };

            Promise.prototype._then = function (
                didFulfill,
                didReject,
                _,    receiver,
                internalData
            ) {
                var haveInternalData = internalData !== undefined;
                var promise = haveInternalData ? internalData : new Promise(INTERNAL);
                var target = this._target();
                var bitField = target._bitField;

                if (!haveInternalData) {
                    promise._propagateFrom(this, 3);
                    promise._captureStackTrace();
                    if (receiver === undefined &&
                        ((this._bitField & 2097152) !== 0)) {
                        if (!((bitField & 50397184) === 0)) {
                            receiver = this._boundValue();
                        } else {
                            receiver = target === this ? undefined : this._boundTo;
                        }
                    }
                    this._fireEvent("promiseChained", this, promise);
                }

                var domain = getDomain();
                if (!((bitField & 50397184) === 0)) {
                    var handler, value, settler = target._settlePromiseCtx;
                    if (((bitField & 33554432) !== 0)) {
                        value = target._rejectionHandler0;
                        handler = didFulfill;
                    } else if (((bitField & 16777216) !== 0)) {
                        value = target._fulfillmentHandler0;
                        handler = didReject;
                        target._unsetRejectionIsUnhandled();
                    } else {
                        settler = target._settlePromiseLateCancellationObserver;
                        value = new CancellationError("late cancellation observer");
                        target._attachExtraTrace(value);
                        handler = didReject;
                    }

                    async.invoke(settler, target, {
                        handler: domain === null ? handler
                            : (typeof handler === "function" &&
                                util.domainBind(domain, handler)),
                        promise: promise,
                        receiver: receiver,
                        value: value
                    });
                } else {
                    target._addCallbacks(didFulfill, didReject, promise, receiver, domain);
                }

                return promise;
            };

            Promise.prototype._length = function () {
                return this._bitField & 65535;
            };

            Promise.prototype._isFateSealed = function () {
                return (this._bitField & 117506048) !== 0;
            };

            Promise.prototype._isFollowing = function () {
                return (this._bitField & 67108864) === 67108864;
            };

            Promise.prototype._setLength = function (len) {
                this._bitField = (this._bitField & -65536) |
                    (len & 65535);
            };

            Promise.prototype._setFulfilled = function () {
                this._bitField = this._bitField | 33554432;
                this._fireEvent("promiseFulfilled", this);
            };

            Promise.prototype._setRejected = function () {
                this._bitField = this._bitField | 16777216;
                this._fireEvent("promiseRejected", this);
            };

            Promise.prototype._setFollowing = function () {
                this._bitField = this._bitField | 67108864;
                this._fireEvent("promiseResolved", this);
            };

            Promise.prototype._setIsFinal = function () {
                this._bitField = this._bitField | 4194304;
            };

            Promise.prototype._isFinal = function () {
                return (this._bitField & 4194304) > 0;
            };

            Promise.prototype._unsetCancelled = function() {
                this._bitField = this._bitField & (~65536);
            };

            Promise.prototype._setCancelled = function() {
                this._bitField = this._bitField | 65536;
                this._fireEvent("promiseCancelled", this);
            };

            Promise.prototype._setWillBeCancelled = function() {
                this._bitField = this._bitField | 8388608;
            };

            Promise.prototype._setAsyncGuaranteed = function() {
                if (async.hasCustomScheduler()) return;
                this._bitField = this._bitField | 134217728;
            };

            Promise.prototype._receiverAt = function (index) {
                var ret = index === 0 ? this._receiver0 : this[
                        index * 4 - 4 + 3];
                if (ret === UNDEFINED_BINDING) {
                    return undefined;
                } else if (ret === undefined && this._isBound()) {
                    return this._boundValue();
                }
                return ret;
            };

            Promise.prototype._promiseAt = function (index) {
                return this[
                        index * 4 - 4 + 2];
            };

            Promise.prototype._fulfillmentHandlerAt = function (index) {
                return this[
                        index * 4 - 4 + 0];
            };

            Promise.prototype._rejectionHandlerAt = function (index) {
                return this[
                        index * 4 - 4 + 1];
            };

            Promise.prototype._boundValue = function() {};

            Promise.prototype._migrateCallback0 = function (follower) {
                var bitField = follower._bitField;
                var fulfill = follower._fulfillmentHandler0;
                var reject = follower._rejectionHandler0;
                var promise = follower._promise0;
                var receiver = follower._receiverAt(0);
                if (receiver === undefined) receiver = UNDEFINED_BINDING;
                this._addCallbacks(fulfill, reject, promise, receiver, null);
            };

            Promise.prototype._migrateCallbackAt = function (follower, index) {
                var fulfill = follower._fulfillmentHandlerAt(index);
                var reject = follower._rejectionHandlerAt(index);
                var promise = follower._promiseAt(index);
                var receiver = follower._receiverAt(index);
                if (receiver === undefined) receiver = UNDEFINED_BINDING;
                this._addCallbacks(fulfill, reject, promise, receiver, null);
            };

            Promise.prototype._addCallbacks = function (
                fulfill,
                reject,
                promise,
                receiver,
                domain
            ) {
                var index = this._length();

                if (index >= 65535 - 4) {
                    index = 0;
                    this._setLength(0);
                }

                if (index === 0) {
                    this._promise0 = promise;
                    this._receiver0 = receiver;
                    if (typeof fulfill === "function") {
                        this._fulfillmentHandler0 =
                            domain === null ? fulfill : util.domainBind(domain, fulfill);
                    }
                    if (typeof reject === "function") {
                        this._rejectionHandler0 =
                            domain === null ? reject : util.domainBind(domain, reject);
                    }
                } else {
                    var base = index * 4 - 4;
                    this[base + 2] = promise;
                    this[base + 3] = receiver;
                    if (typeof fulfill === "function") {
                        this[base + 0] =
                            domain === null ? fulfill : util.domainBind(domain, fulfill);
                    }
                    if (typeof reject === "function") {
                        this[base + 1] =
                            domain === null ? reject : util.domainBind(domain, reject);
                    }
                }
                this._setLength(index + 1);
                return index;
            };

            Promise.prototype._proxy = function (proxyable, arg) {
                this._addCallbacks(undefined, undefined, arg, proxyable, null);
            };

            Promise.prototype._resolveCallback = function(value, shouldBind) {
                if (((this._bitField & 117506048) !== 0)) return;
                if (value === this)
                    return this._rejectCallback(makeSelfResolutionError(), false);
                var maybePromise = tryConvertToPromise(value, this);
                if (!(maybePromise instanceof Promise)) return this._fulfill(value);

                if (shouldBind) this._propagateFrom(maybePromise, 2);

                var promise = maybePromise._target();

                if (promise === this) {
                    this._reject(makeSelfResolutionError());
                    return;
                }

                var bitField = promise._bitField;
                if (((bitField & 50397184) === 0)) {
                    var len = this._length();
                    if (len > 0) promise._migrateCallback0(this);
                    for (var i = 1; i < len; ++i) {
                        promise._migrateCallbackAt(this, i);
                    }
                    this._setFollowing();
                    this._setLength(0);
                    this._setFollowee(promise);
                } else if (((bitField & 33554432) !== 0)) {
                    this._fulfill(promise._value());
                } else if (((bitField & 16777216) !== 0)) {
                    this._reject(promise._reason());
                } else {
                    var reason = new CancellationError("late cancellation observer");
                    promise._attachExtraTrace(reason);
                    this._reject(reason);
                }
            };

            Promise.prototype._rejectCallback =
            function(reason, synchronous, ignoreNonErrorWarnings) {
                var trace = util.ensureErrorObject(reason);
                var hasStack = trace === reason;
                if (!hasStack && !ignoreNonErrorWarnings && debug.warnings()) {
                    var message = "a promise was rejected with a non-error: " +
                        util.classString(reason);
                    this._warn(message, true);
                }
                this._attachExtraTrace(trace, synchronous ? hasStack : false);
                this._reject(reason);
            };

            Promise.prototype._resolveFromExecutor = function (executor) {
                if (executor === INTERNAL) return;
                var promise = this;
                this._captureStackTrace();
                this._pushContext();
                var synchronous = true;
                var r = this._execute(executor, function(value) {
                    promise._resolveCallback(value);
                }, function (reason) {
                    promise._rejectCallback(reason, synchronous);
                });
                synchronous = false;
                this._popContext();

                if (r !== undefined) {
                    promise._rejectCallback(r, true);
                }
            };

            Promise.prototype._settlePromiseFromHandler = function (
                handler, receiver, value, promise
            ) {
                var bitField = promise._bitField;
                if (((bitField & 65536) !== 0)) return;
                promise._pushContext();
                var x;
                if (receiver === APPLY) {
                    if (!value || typeof value.length !== "number") {
                        x = errorObj;
                        x.e = new TypeError("cannot .spread() a non-array: " +
                                                util.classString(value));
                    } else {
                        x = tryCatch(handler).apply(this._boundValue(), value);
                    }
                } else {
                    x = tryCatch(handler).call(receiver, value);
                }
                var promiseCreated = promise._popContext();
                bitField = promise._bitField;
                if (((bitField & 65536) !== 0)) return;

                if (x === NEXT_FILTER) {
                    promise._reject(value);
                } else if (x === errorObj) {
                    promise._rejectCallback(x.e, false);
                } else {
                    debug.checkForgottenReturns(x, promiseCreated, "",  promise, this);
                    promise._resolveCallback(x);
                }
            };

            Promise.prototype._target = function() {
                var ret = this;
                while (ret._isFollowing()) ret = ret._followee();
                return ret;
            };

            Promise.prototype._followee = function() {
                return this._rejectionHandler0;
            };

            Promise.prototype._setFollowee = function(promise) {
                this._rejectionHandler0 = promise;
            };

            Promise.prototype._settlePromise = function(promise, handler, receiver, value) {
                var isPromise = promise instanceof Promise;
                var bitField = this._bitField;
                var asyncGuaranteed = ((bitField & 134217728) !== 0);
                if (((bitField & 65536) !== 0)) {
                    if (isPromise) promise._invokeInternalOnCancel();

                    if (receiver instanceof PassThroughHandlerContext &&
                        receiver.isFinallyHandler()) {
                        receiver.cancelPromise = promise;
                        if (tryCatch(handler).call(receiver, value) === errorObj) {
                            promise._reject(errorObj.e);
                        }
                    } else if (handler === reflectHandler) {
                        promise._fulfill(reflectHandler.call(receiver));
                    } else if (receiver instanceof Proxyable) {
                        receiver._promiseCancelled(promise);
                    } else if (isPromise || promise instanceof PromiseArray) {
                        promise._cancel();
                    } else {
                        receiver.cancel();
                    }
                } else if (typeof handler === "function") {
                    if (!isPromise) {
                        handler.call(receiver, value, promise);
                    } else {
                        if (asyncGuaranteed) promise._setAsyncGuaranteed();
                        this._settlePromiseFromHandler(handler, receiver, value, promise);
                    }
                } else if (receiver instanceof Proxyable) {
                    if (!receiver._isResolved()) {
                        if (((bitField & 33554432) !== 0)) {
                            receiver._promiseFulfilled(value, promise);
                        } else {
                            receiver._promiseRejected(value, promise);
                        }
                    }
                } else if (isPromise) {
                    if (asyncGuaranteed) promise._setAsyncGuaranteed();
                    if (((bitField & 33554432) !== 0)) {
                        promise._fulfill(value);
                    } else {
                        promise._reject(value);
                    }
                }
            };

            Promise.prototype._settlePromiseLateCancellationObserver = function(ctx) {
                var handler = ctx.handler;
                var promise = ctx.promise;
                var receiver = ctx.receiver;
                var value = ctx.value;
                if (typeof handler === "function") {
                    if (!(promise instanceof Promise)) {
                        handler.call(receiver, value, promise);
                    } else {
                        this._settlePromiseFromHandler(handler, receiver, value, promise);
                    }
                } else if (promise instanceof Promise) {
                    promise._reject(value);
                }
            };

            Promise.prototype._settlePromiseCtx = function(ctx) {
                this._settlePromise(ctx.promise, ctx.handler, ctx.receiver, ctx.value);
            };

            Promise.prototype._settlePromise0 = function(handler, value, bitField) {
                var promise = this._promise0;
                var receiver = this._receiverAt(0);
                this._promise0 = undefined;
                this._receiver0 = undefined;
                this._settlePromise(promise, handler, receiver, value);
            };

            Promise.prototype._clearCallbackDataAtIndex = function(index) {
                var base = index * 4 - 4;
                this[base + 2] =
                this[base + 3] =
                this[base + 0] =
                this[base + 1] = undefined;
            };

            Promise.prototype._fulfill = function (value) {
                var bitField = this._bitField;
                if (((bitField & 117506048) >>> 16)) return;
                if (value === this) {
                    var err = makeSelfResolutionError();
                    this._attachExtraTrace(err);
                    return this._reject(err);
                }
                this._setFulfilled();
                this._rejectionHandler0 = value;

                if ((bitField & 65535) > 0) {
                    if (((bitField & 134217728) !== 0)) {
                        this._settlePromises();
                    } else {
                        async.settlePromises(this);
                    }
                    this._dereferenceTrace();
                }
            };

            Promise.prototype._reject = function (reason) {
                var bitField = this._bitField;
                if (((bitField & 117506048) >>> 16)) return;
                this._setRejected();
                this._fulfillmentHandler0 = reason;

                if (this._isFinal()) {
                    return async.fatalError(reason, util.isNode);
                }

                if ((bitField & 65535) > 0) {
                    async.settlePromises(this);
                } else {
                    this._ensurePossibleRejectionHandled();
                }
            };

            Promise.prototype._fulfillPromises = function (len, value) {
                for (var i = 1; i < len; i++) {
                    var handler = this._fulfillmentHandlerAt(i);
                    var promise = this._promiseAt(i);
                    var receiver = this._receiverAt(i);
                    this._clearCallbackDataAtIndex(i);
                    this._settlePromise(promise, handler, receiver, value);
                }
            };

            Promise.prototype._rejectPromises = function (len, reason) {
                for (var i = 1; i < len; i++) {
                    var handler = this._rejectionHandlerAt(i);
                    var promise = this._promiseAt(i);
                    var receiver = this._receiverAt(i);
                    this._clearCallbackDataAtIndex(i);
                    this._settlePromise(promise, handler, receiver, reason);
                }
            };

            Promise.prototype._settlePromises = function () {
                var bitField = this._bitField;
                var len = (bitField & 65535);

                if (len > 0) {
                    if (((bitField & 16842752) !== 0)) {
                        var reason = this._fulfillmentHandler0;
                        this._settlePromise0(this._rejectionHandler0, reason, bitField);
                        this._rejectPromises(len, reason);
                    } else {
                        var value = this._rejectionHandler0;
                        this._settlePromise0(this._fulfillmentHandler0, value, bitField);
                        this._fulfillPromises(len, value);
                    }
                    this._setLength(0);
                }
                this._clearCancellationData();
            };

            Promise.prototype._settledValue = function() {
                var bitField = this._bitField;
                if (((bitField & 33554432) !== 0)) {
                    return this._rejectionHandler0;
                } else if (((bitField & 16777216) !== 0)) {
                    return this._fulfillmentHandler0;
                }
            };

            function deferResolve(v) {this.promise._resolveCallback(v);}
            function deferReject(v) {this.promise._rejectCallback(v, false);}

            Promise.defer = Promise.pending = function() {
                debug.deprecated("Promise.defer", "new Promise");
                var promise = new Promise(INTERNAL);
                return {
                    promise: promise,
                    resolve: deferResolve,
                    reject: deferReject
                };
            };

            util.notEnumerableProp(Promise,
                                   "_makeSelfResolutionError",
                                   makeSelfResolutionError);

            _dereq_("./method")(Promise, INTERNAL, tryConvertToPromise, apiRejection,
                debug);
            _dereq_("./bind")(Promise, INTERNAL, tryConvertToPromise, debug);
            _dereq_("./cancel")(Promise, PromiseArray, apiRejection, debug);
            _dereq_("./direct_resolve")(Promise);
            _dereq_("./synchronous_inspection")(Promise);
            _dereq_("./join")(
                Promise, PromiseArray, tryConvertToPromise, INTERNAL, async, getDomain);
            Promise.Promise = Promise;
            Promise.version = "3.5.2";
            _dereq_('./map.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
            _dereq_('./call_get.js')(Promise);
            _dereq_('./using.js')(Promise, apiRejection, tryConvertToPromise, createContext, INTERNAL, debug);
            _dereq_('./timers.js')(Promise, INTERNAL, debug);
            _dereq_('./generators.js')(Promise, apiRejection, INTERNAL, tryConvertToPromise, Proxyable, debug);
            _dereq_('./nodeify.js')(Promise);
            _dereq_('./promisify.js')(Promise, INTERNAL);
            _dereq_('./props.js')(Promise, PromiseArray, tryConvertToPromise, apiRejection);
            _dereq_('./race.js')(Promise, INTERNAL, tryConvertToPromise, apiRejection);
            _dereq_('./reduce.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
            _dereq_('./settle.js')(Promise, PromiseArray, debug);
            _dereq_('./some.js')(Promise, PromiseArray, apiRejection);
            _dereq_('./filter.js')(Promise, INTERNAL);
            _dereq_('./each.js')(Promise, INTERNAL);
            _dereq_('./any.js')(Promise);
                                                                     
                util.toFastProperties(Promise);                                          
                util.toFastProperties(Promise.prototype);                                
                function fillTypes(value) {                                              
                    var p = new Promise(INTERNAL);                                       
                    p._fulfillmentHandler0 = value;                                      
                    p._rejectionHandler0 = value;                                        
                    p._promise0 = value;                                                 
                    p._receiver0 = value;                                                
                }                                                                        
                // Complete slack tracking, opt out of field-type tracking and           
                // stabilize map                                                         
                fillTypes({a: 1});                                                       
                fillTypes({b: 2});                                                       
                fillTypes({c: 3});                                                       
                fillTypes(1);                                                            
                fillTypes(function(){});                                                 
                fillTypes(undefined);                                                    
                fillTypes(false);                                                        
                fillTypes(new Promise(INTERNAL));                                        
                debug.setBounds(Async.firstLineError, util.lastLineError);               
                return Promise;                                                          

            };

            },{"./any.js":1,"./async":2,"./bind":3,"./call_get.js":5,"./cancel":6,"./catch_filter":7,"./context":8,"./debuggability":9,"./direct_resolve":10,"./each.js":11,"./errors":12,"./es5":13,"./filter.js":14,"./finally":15,"./generators.js":16,"./join":17,"./map.js":18,"./method":19,"./nodeback":20,"./nodeify.js":21,"./promise_array":23,"./promisify.js":24,"./props.js":25,"./race.js":27,"./reduce.js":28,"./settle.js":30,"./some.js":31,"./synchronous_inspection":32,"./thenables":33,"./timers.js":34,"./using.js":35,"./util":36}],23:[function(_dereq_,module,exports){
            module.exports = function(Promise, INTERNAL, tryConvertToPromise,
                apiRejection, Proxyable) {
            var util = _dereq_("./util");
            var isArray = util.isArray;

            function toResolutionValue(val) {
                switch(val) {
                case -2: return [];
                case -3: return {};
                case -6: return new Map();
                }
            }

            function PromiseArray(values) {
                var promise = this._promise = new Promise(INTERNAL);
                if (values instanceof Promise) {
                    promise._propagateFrom(values, 3);
                }
                promise._setOnCancel(this);
                this._values = values;
                this._length = 0;
                this._totalResolved = 0;
                this._init(undefined, -2);
            }
            util.inherits(PromiseArray, Proxyable);

            PromiseArray.prototype.length = function () {
                return this._length;
            };

            PromiseArray.prototype.promise = function () {
                return this._promise;
            };

            PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {
                var values = tryConvertToPromise(this._values, this._promise);
                if (values instanceof Promise) {
                    values = values._target();
                    var bitField = values._bitField;
                    this._values = values;

                    if (((bitField & 50397184) === 0)) {
                        this._promise._setAsyncGuaranteed();
                        return values._then(
                            init,
                            this._reject,
                            undefined,
                            this,
                            resolveValueIfEmpty
                       );
                    } else if (((bitField & 33554432) !== 0)) {
                        values = values._value();
                    } else if (((bitField & 16777216) !== 0)) {
                        return this._reject(values._reason());
                    } else {
                        return this._cancel();
                    }
                }
                values = util.asArray(values);
                if (values === null) {
                    var err = apiRejection(
                        "expecting an array or an iterable object but got " + util.classString(values)).reason();
                    this._promise._rejectCallback(err, false);
                    return;
                }

                if (values.length === 0) {
                    if (resolveValueIfEmpty === -5) {
                        this._resolveEmptyArray();
                    }
                    else {
                        this._resolve(toResolutionValue(resolveValueIfEmpty));
                    }
                    return;
                }
                this._iterate(values);
            };

            PromiseArray.prototype._iterate = function(values) {
                var len = this.getActualLength(values.length);
                this._length = len;
                this._values = this.shouldCopyValues() ? new Array(len) : this._values;
                var result = this._promise;
                var isResolved = false;
                var bitField = null;
                for (var i = 0; i < len; ++i) {
                    var maybePromise = tryConvertToPromise(values[i], result);

                    if (maybePromise instanceof Promise) {
                        maybePromise = maybePromise._target();
                        bitField = maybePromise._bitField;
                    } else {
                        bitField = null;
                    }

                    if (isResolved) {
                        if (bitField !== null) {
                            maybePromise.suppressUnhandledRejections();
                        }
                    } else if (bitField !== null) {
                        if (((bitField & 50397184) === 0)) {
                            maybePromise._proxy(this, i);
                            this._values[i] = maybePromise;
                        } else if (((bitField & 33554432) !== 0)) {
                            isResolved = this._promiseFulfilled(maybePromise._value(), i);
                        } else if (((bitField & 16777216) !== 0)) {
                            isResolved = this._promiseRejected(maybePromise._reason(), i);
                        } else {
                            isResolved = this._promiseCancelled(i);
                        }
                    } else {
                        isResolved = this._promiseFulfilled(maybePromise, i);
                    }
                }
                if (!isResolved) result._setAsyncGuaranteed();
            };

            PromiseArray.prototype._isResolved = function () {
                return this._values === null;
            };

            PromiseArray.prototype._resolve = function (value) {
                this._values = null;
                this._promise._fulfill(value);
            };

            PromiseArray.prototype._cancel = function() {
                if (this._isResolved() || !this._promise._isCancellable()) return;
                this._values = null;
                this._promise._cancel();
            };

            PromiseArray.prototype._reject = function (reason) {
                this._values = null;
                this._promise._rejectCallback(reason, false);
            };

            PromiseArray.prototype._promiseFulfilled = function (value, index) {
                this._values[index] = value;
                var totalResolved = ++this._totalResolved;
                if (totalResolved >= this._length) {
                    this._resolve(this._values);
                    return true;
                }
                return false;
            };

            PromiseArray.prototype._promiseCancelled = function() {
                this._cancel();
                return true;
            };

            PromiseArray.prototype._promiseRejected = function (reason) {
                this._totalResolved++;
                this._reject(reason);
                return true;
            };

            PromiseArray.prototype._resultCancelled = function() {
                if (this._isResolved()) return;
                var values = this._values;
                this._cancel();
                if (values instanceof Promise) {
                    values.cancel();
                } else {
                    for (var i = 0; i < values.length; ++i) {
                        if (values[i] instanceof Promise) {
                            values[i].cancel();
                        }
                    }
                }
            };

            PromiseArray.prototype.shouldCopyValues = function () {
                return true;
            };

            PromiseArray.prototype.getActualLength = function (len) {
                return len;
            };

            return PromiseArray;
            };

            },{"./util":36}],24:[function(_dereq_,module,exports){
            module.exports = function(Promise, INTERNAL) {
            var THIS = {};
            var util = _dereq_("./util");
            var nodebackForPromise = _dereq_("./nodeback");
            var withAppended = util.withAppended;
            var maybeWrapAsError = util.maybeWrapAsError;
            var canEvaluate = util.canEvaluate;
            var TypeError = _dereq_("./errors").TypeError;
            var defaultSuffix = "Async";
            var defaultPromisified = {__isPromisified__: true};
            var noCopyProps = [
                "arity",    "length",
                "name",
                "arguments",
                "caller",
                "callee",
                "prototype",
                "__isPromisified__"
            ];
            var noCopyPropsPattern = new RegExp("^(?:" + noCopyProps.join("|") + ")$");

            var defaultFilter = function(name) {
                return util.isIdentifier(name) &&
                    name.charAt(0) !== "_" &&
                    name !== "constructor";
            };

            function propsFilter(key) {
                return !noCopyPropsPattern.test(key);
            }

            function isPromisified(fn) {
                try {
                    return fn.__isPromisified__ === true;
                }
                catch (e) {
                    return false;
                }
            }

            function hasPromisified(obj, key, suffix) {
                var val = util.getDataPropertyOrDefault(obj, key + suffix,
                                                        defaultPromisified);
                return val ? isPromisified(val) : false;
            }
            function checkValid(ret, suffix, suffixRegexp) {
                for (var i = 0; i < ret.length; i += 2) {
                    var key = ret[i];
                    if (suffixRegexp.test(key)) {
                        var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
                        for (var j = 0; j < ret.length; j += 2) {
                            if (ret[j] === keyWithoutAsyncSuffix) {
                                throw new TypeError("Cannot promisify an API that has normal methods with '%s'-suffix\u000a\u000a    See http://goo.gl/MqrFmX\u000a"
                                    .replace("%s", suffix));
                            }
                        }
                    }
                }
            }

            function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
                var keys = util.inheritedDataKeys(obj);
                var ret = [];
                for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    var value = obj[key];
                    var passesDefaultFilter = filter === defaultFilter
                        ? true : defaultFilter(key, value, obj);
                    if (typeof value === "function" &&
                        !isPromisified(value) &&
                        !hasPromisified(obj, key, suffix) &&
                        filter(key, value, obj, passesDefaultFilter)) {
                        ret.push(key, value);
                    }
                }
                checkValid(ret, suffix, suffixRegexp);
                return ret;
            }

            var escapeIdentRegex = function(str) {
                return str.replace(/([$])/, "\\$");
            };

            var makeNodePromisifiedEval;

            function makeNodePromisifiedClosure(callback, receiver, _, fn, __, multiArgs) {
                var defaultThis = (function() {return this;})();
                var method = callback;
                if (typeof method === "string") {
                    callback = fn;
                }
                function promisified() {
                    var _receiver = receiver;
                    if (receiver === THIS) _receiver = this;
                    var promise = new Promise(INTERNAL);
                    promise._captureStackTrace();
                    var cb = typeof method === "string" && this !== defaultThis
                        ? this[method] : callback;
                    var fn = nodebackForPromise(promise, multiArgs);
                    try {
                        cb.apply(_receiver, withAppended(arguments, fn));
                    } catch(e) {
                        promise._rejectCallback(maybeWrapAsError(e), true, true);
                    }
                    if (!promise._isFateSealed()) promise._setAsyncGuaranteed();
                    return promise;
                }
                util.notEnumerableProp(promisified, "__isPromisified__", true);
                return promisified;
            }

            var makeNodePromisified = canEvaluate
                ? makeNodePromisifiedEval
                : makeNodePromisifiedClosure;

            function promisifyAll(obj, suffix, filter, promisifier, multiArgs) {
                var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
                var methods =
                    promisifiableMethods(obj, suffix, suffixRegexp, filter);

                for (var i = 0, len = methods.length; i < len; i+= 2) {
                    var key = methods[i];
                    var fn = methods[i+1];
                    var promisifiedKey = key + suffix;
                    if (promisifier === makeNodePromisified) {
                        obj[promisifiedKey] =
                            makeNodePromisified(key, THIS, key, fn, suffix, multiArgs);
                    } else {
                        var promisified = promisifier(fn, function() {
                            return makeNodePromisified(key, THIS, key,
                                                       fn, suffix, multiArgs);
                        });
                        util.notEnumerableProp(promisified, "__isPromisified__", true);
                        obj[promisifiedKey] = promisified;
                    }
                }
                util.toFastProperties(obj);
                return obj;
            }

            function promisify(callback, receiver, multiArgs) {
                return makeNodePromisified(callback, receiver, undefined,
                                            callback, null, multiArgs);
            }

            Promise.promisify = function (fn, options) {
                if (typeof fn !== "function") {
                    throw new TypeError("expecting a function but got " + util.classString(fn));
                }
                if (isPromisified(fn)) {
                    return fn;
                }
                options = Object(options);
                var receiver = options.context === undefined ? THIS : options.context;
                var multiArgs = !!options.multiArgs;
                var ret = promisify(fn, receiver, multiArgs);
                util.copyDescriptors(fn, ret, propsFilter);
                return ret;
            };

            Promise.promisifyAll = function (target, options) {
                if (typeof target !== "function" && typeof target !== "object") {
                    throw new TypeError("the target of promisifyAll must be an object or a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
                }
                options = Object(options);
                var multiArgs = !!options.multiArgs;
                var suffix = options.suffix;
                if (typeof suffix !== "string") suffix = defaultSuffix;
                var filter = options.filter;
                if (typeof filter !== "function") filter = defaultFilter;
                var promisifier = options.promisifier;
                if (typeof promisifier !== "function") promisifier = makeNodePromisified;

                if (!util.isIdentifier(suffix)) {
                    throw new RangeError("suffix must be a valid identifier\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
                }

                var keys = util.inheritedDataKeys(target);
                for (var i = 0; i < keys.length; ++i) {
                    var value = target[keys[i]];
                    if (keys[i] !== "constructor" &&
                        util.isClass(value)) {
                        promisifyAll(value.prototype, suffix, filter, promisifier,
                            multiArgs);
                        promisifyAll(value, suffix, filter, promisifier, multiArgs);
                    }
                }

                return promisifyAll(target, suffix, filter, promisifier, multiArgs);
            };
            };


            },{"./errors":12,"./nodeback":20,"./util":36}],25:[function(_dereq_,module,exports){
            module.exports = function(
                Promise, PromiseArray, tryConvertToPromise, apiRejection) {
            var util = _dereq_("./util");
            var isObject = util.isObject;
            var es5 = _dereq_("./es5");
            var Es6Map;
            if (typeof Map === "function") Es6Map = Map;

            var mapToEntries = (function() {
                var index = 0;
                var size = 0;

                function extractEntry(value, key) {
                    this[index] = value;
                    this[index + size] = key;
                    index++;
                }

                return function mapToEntries(map) {
                    size = map.size;
                    index = 0;
                    var ret = new Array(map.size * 2);
                    map.forEach(extractEntry, ret);
                    return ret;
                };
            })();

            var entriesToMap = function(entries) {
                var ret = new Es6Map();
                var length = entries.length / 2 | 0;
                for (var i = 0; i < length; ++i) {
                    var key = entries[length + i];
                    var value = entries[i];
                    ret.set(key, value);
                }
                return ret;
            };

            function PropertiesPromiseArray(obj) {
                var isMap = false;
                var entries;
                if (Es6Map !== undefined && obj instanceof Es6Map) {
                    entries = mapToEntries(obj);
                    isMap = true;
                } else {
                    var keys = es5.keys(obj);
                    var len = keys.length;
                    entries = new Array(len * 2);
                    for (var i = 0; i < len; ++i) {
                        var key = keys[i];
                        entries[i] = obj[key];
                        entries[i + len] = key;
                    }
                }
                this.constructor$(entries);
                this._isMap = isMap;
                this._init$(undefined, isMap ? -6 : -3);
            }
            util.inherits(PropertiesPromiseArray, PromiseArray);

            PropertiesPromiseArray.prototype._init = function () {};

            PropertiesPromiseArray.prototype._promiseFulfilled = function (value, index) {
                this._values[index] = value;
                var totalResolved = ++this._totalResolved;
                if (totalResolved >= this._length) {
                    var val;
                    if (this._isMap) {
                        val = entriesToMap(this._values);
                    } else {
                        val = {};
                        var keyOffset = this.length();
                        for (var i = 0, len = this.length(); i < len; ++i) {
                            val[this._values[i + keyOffset]] = this._values[i];
                        }
                    }
                    this._resolve(val);
                    return true;
                }
                return false;
            };

            PropertiesPromiseArray.prototype.shouldCopyValues = function () {
                return false;
            };

            PropertiesPromiseArray.prototype.getActualLength = function (len) {
                return len >> 1;
            };

            function props(promises) {
                var ret;
                var castValue = tryConvertToPromise(promises);

                if (!isObject(castValue)) {
                    return apiRejection("cannot await properties of a non-object\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
                } else if (castValue instanceof Promise) {
                    ret = castValue._then(
                        Promise.props, undefined, undefined, undefined, undefined);
                } else {
                    ret = new PropertiesPromiseArray(castValue).promise();
                }

                if (castValue instanceof Promise) {
                    ret._propagateFrom(castValue, 2);
                }
                return ret;
            }

            Promise.prototype.props = function () {
                return props(this);
            };

            Promise.props = function (promises) {
                return props(promises);
            };
            };

            },{"./es5":13,"./util":36}],26:[function(_dereq_,module,exports){
            function arrayMove(src, srcIndex, dst, dstIndex, len) {
                for (var j = 0; j < len; ++j) {
                    dst[j + dstIndex] = src[j + srcIndex];
                    src[j + srcIndex] = void 0;
                }
            }

            function Queue(capacity) {
                this._capacity = capacity;
                this._length = 0;
                this._front = 0;
            }

            Queue.prototype._willBeOverCapacity = function (size) {
                return this._capacity < size;
            };

            Queue.prototype._pushOne = function (arg) {
                var length = this.length();
                this._checkCapacity(length + 1);
                var i = (this._front + length) & (this._capacity - 1);
                this[i] = arg;
                this._length = length + 1;
            };

            Queue.prototype.push = function (fn, receiver, arg) {
                var length = this.length() + 3;
                if (this._willBeOverCapacity(length)) {
                    this._pushOne(fn);
                    this._pushOne(receiver);
                    this._pushOne(arg);
                    return;
                }
                var j = this._front + length - 3;
                this._checkCapacity(length);
                var wrapMask = this._capacity - 1;
                this[(j + 0) & wrapMask] = fn;
                this[(j + 1) & wrapMask] = receiver;
                this[(j + 2) & wrapMask] = arg;
                this._length = length;
            };

            Queue.prototype.shift = function () {
                var front = this._front,
                    ret = this[front];

                this[front] = undefined;
                this._front = (front + 1) & (this._capacity - 1);
                this._length--;
                return ret;
            };

            Queue.prototype.length = function () {
                return this._length;
            };

            Queue.prototype._checkCapacity = function (size) {
                if (this._capacity < size) {
                    this._resizeTo(this._capacity << 1);
                }
            };

            Queue.prototype._resizeTo = function (capacity) {
                var oldCapacity = this._capacity;
                this._capacity = capacity;
                var front = this._front;
                var length = this._length;
                var moveItemsCount = (front + length) & (oldCapacity - 1);
                arrayMove(this, 0, this, oldCapacity, moveItemsCount);
            };

            module.exports = Queue;

            },{}],27:[function(_dereq_,module,exports){
            module.exports = function(
                Promise, INTERNAL, tryConvertToPromise, apiRejection) {
            var util = _dereq_("./util");

            var raceLater = function (promise) {
                return promise.then(function(array) {
                    return race(array, promise);
                });
            };

            function race(promises, parent) {
                var maybePromise = tryConvertToPromise(promises);

                if (maybePromise instanceof Promise) {
                    return raceLater(maybePromise);
                } else {
                    promises = util.asArray(promises);
                    if (promises === null)
                        return apiRejection("expecting an array or an iterable object but got " + util.classString(promises));
                }

                var ret = new Promise(INTERNAL);
                if (parent !== undefined) {
                    ret._propagateFrom(parent, 3);
                }
                var fulfill = ret._fulfill;
                var reject = ret._reject;
                for (var i = 0, len = promises.length; i < len; ++i) {
                    var val = promises[i];

                    if (val === undefined && !(i in promises)) {
                        continue;
                    }

                    Promise.cast(val)._then(fulfill, reject, undefined, ret, null);
                }
                return ret;
            }

            Promise.race = function (promises) {
                return race(promises, undefined);
            };

            Promise.prototype.race = function () {
                return race(this, undefined);
            };

            };

            },{"./util":36}],28:[function(_dereq_,module,exports){
            module.exports = function(Promise,
                                      PromiseArray,
                                      apiRejection,
                                      tryConvertToPromise,
                                      INTERNAL,
                                      debug) {
            var getDomain = Promise._getDomain;
            var util = _dereq_("./util");
            var tryCatch = util.tryCatch;

            function ReductionPromiseArray(promises, fn, initialValue, _each) {
                this.constructor$(promises);
                var domain = getDomain();
                this._fn = domain === null ? fn : util.domainBind(domain, fn);
                if (initialValue !== undefined) {
                    initialValue = Promise.resolve(initialValue);
                    initialValue._attachCancellationCallback(this);
                }
                this._initialValue = initialValue;
                this._currentCancellable = null;
                if(_each === INTERNAL) {
                    this._eachValues = Array(this._length);
                } else if (_each === 0) {
                    this._eachValues = null;
                } else {
                    this._eachValues = undefined;
                }
                this._promise._captureStackTrace();
                this._init$(undefined, -5);
            }
            util.inherits(ReductionPromiseArray, PromiseArray);

            ReductionPromiseArray.prototype._gotAccum = function(accum) {
                if (this._eachValues !== undefined && 
                    this._eachValues !== null && 
                    accum !== INTERNAL) {
                    this._eachValues.push(accum);
                }
            };

            ReductionPromiseArray.prototype._eachComplete = function(value) {
                if (this._eachValues !== null) {
                    this._eachValues.push(value);
                }
                return this._eachValues;
            };

            ReductionPromiseArray.prototype._init = function() {};

            ReductionPromiseArray.prototype._resolveEmptyArray = function() {
                this._resolve(this._eachValues !== undefined ? this._eachValues
                                                             : this._initialValue);
            };

            ReductionPromiseArray.prototype.shouldCopyValues = function () {
                return false;
            };

            ReductionPromiseArray.prototype._resolve = function(value) {
                this._promise._resolveCallback(value);
                this._values = null;
            };

            ReductionPromiseArray.prototype._resultCancelled = function(sender) {
                if (sender === this._initialValue) return this._cancel();
                if (this._isResolved()) return;
                this._resultCancelled$();
                if (this._currentCancellable instanceof Promise) {
                    this._currentCancellable.cancel();
                }
                if (this._initialValue instanceof Promise) {
                    this._initialValue.cancel();
                }
            };

            ReductionPromiseArray.prototype._iterate = function (values) {
                this._values = values;
                var value;
                var i;
                var length = values.length;
                if (this._initialValue !== undefined) {
                    value = this._initialValue;
                    i = 0;
                } else {
                    value = Promise.resolve(values[0]);
                    i = 1;
                }

                this._currentCancellable = value;

                if (!value.isRejected()) {
                    for (; i < length; ++i) {
                        var ctx = {
                            accum: null,
                            value: values[i],
                            index: i,
                            length: length,
                            array: this
                        };
                        value = value._then(gotAccum, undefined, undefined, ctx, undefined);
                    }
                }

                if (this._eachValues !== undefined) {
                    value = value
                        ._then(this._eachComplete, undefined, undefined, this, undefined);
                }
                value._then(completed, completed, undefined, value, this);
            };

            Promise.prototype.reduce = function (fn, initialValue) {
                return reduce(this, fn, initialValue, null);
            };

            Promise.reduce = function (promises, fn, initialValue, _each) {
                return reduce(promises, fn, initialValue, _each);
            };

            function completed(valueOrReason, array) {
                if (this.isFulfilled()) {
                    array._resolve(valueOrReason);
                } else {
                    array._reject(valueOrReason);
                }
            }

            function reduce(promises, fn, initialValue, _each) {
                if (typeof fn !== "function") {
                    return apiRejection("expecting a function but got " + util.classString(fn));
                }
                var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
                return array.promise();
            }

            function gotAccum(accum) {
                this.accum = accum;
                this.array._gotAccum(accum);
                var value = tryConvertToPromise(this.value, this.array._promise);
                if (value instanceof Promise) {
                    this.array._currentCancellable = value;
                    return value._then(gotValue, undefined, undefined, this, undefined);
                } else {
                    return gotValue.call(this, value);
                }
            }

            function gotValue(value) {
                var array = this.array;
                var promise = array._promise;
                var fn = tryCatch(array._fn);
                promise._pushContext();
                var ret;
                if (array._eachValues !== undefined) {
                    ret = fn.call(promise._boundValue(), value, this.index, this.length);
                } else {
                    ret = fn.call(promise._boundValue(),
                                          this.accum, value, this.index, this.length);
                }
                if (ret instanceof Promise) {
                    array._currentCancellable = ret;
                }
                var promiseCreated = promise._popContext();
                debug.checkForgottenReturns(
                    ret,
                    promiseCreated,
                    array._eachValues !== undefined ? "Promise.each" : "Promise.reduce",
                    promise
                );
                return ret;
            }
            };

            },{"./util":36}],29:[function(_dereq_,module,exports){
            var util = _dereq_("./util");
            var schedule;
            var noAsyncScheduler = function() {
                throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
            };
            var NativePromise = util.getNativePromise();
            if (util.isNode && typeof MutationObserver === "undefined") {
                var GlobalSetImmediate = commonjsGlobal.setImmediate;
                var ProcessNextTick = nextTick;
                schedule = util.isRecentNode
                            ? function(fn) { GlobalSetImmediate.call(commonjsGlobal, fn); }
                            : function(fn) { ProcessNextTick.call(process, fn); };
            } else if (typeof NativePromise === "function" &&
                       typeof NativePromise.resolve === "function") {
                var nativePromise = NativePromise.resolve();
                schedule = function(fn) {
                    nativePromise.then(fn);
                };
            } else if ((typeof MutationObserver !== "undefined") &&
                      !(typeof window !== "undefined" &&
                        window.navigator &&
                        (window.navigator.standalone || window.cordova))) {
                schedule = (function() {
                    var div = document.createElement("div");
                    var opts = {attributes: true};
                    var toggleScheduled = false;
                    var div2 = document.createElement("div");
                    var o2 = new MutationObserver(function() {
                        div.classList.toggle("foo");
                        toggleScheduled = false;
                    });
                    o2.observe(div2, opts);

                    var scheduleToggle = function() {
                        if (toggleScheduled) return;
                        toggleScheduled = true;
                        div2.classList.toggle("foo");
                    };

                    return function schedule(fn) {
                        var o = new MutationObserver(function() {
                            o.disconnect();
                            fn();
                        });
                        o.observe(div, opts);
                        scheduleToggle();
                    };
                })();
            } else if (typeof setImmediate !== "undefined") {
                schedule = function (fn) {
                    setImmediate(fn);
                };
            } else if (typeof setTimeout !== "undefined") {
                schedule = function (fn) {
                    setTimeout(fn, 0);
                };
            } else {
                schedule = noAsyncScheduler;
            }
            module.exports = schedule;

            },{"./util":36}],30:[function(_dereq_,module,exports){
            module.exports =
                function(Promise, PromiseArray, debug) {
            var PromiseInspection = Promise.PromiseInspection;
            var util = _dereq_("./util");

            function SettledPromiseArray(values) {
                this.constructor$(values);
            }
            util.inherits(SettledPromiseArray, PromiseArray);

            SettledPromiseArray.prototype._promiseResolved = function (index, inspection) {
                this._values[index] = inspection;
                var totalResolved = ++this._totalResolved;
                if (totalResolved >= this._length) {
                    this._resolve(this._values);
                    return true;
                }
                return false;
            };

            SettledPromiseArray.prototype._promiseFulfilled = function (value, index) {
                var ret = new PromiseInspection();
                ret._bitField = 33554432;
                ret._settledValueField = value;
                return this._promiseResolved(index, ret);
            };
            SettledPromiseArray.prototype._promiseRejected = function (reason, index) {
                var ret = new PromiseInspection();
                ret._bitField = 16777216;
                ret._settledValueField = reason;
                return this._promiseResolved(index, ret);
            };

            Promise.settle = function (promises) {
                debug.deprecated(".settle()", ".reflect()");
                return new SettledPromiseArray(promises).promise();
            };

            Promise.prototype.settle = function () {
                return Promise.settle(this);
            };
            };

            },{"./util":36}],31:[function(_dereq_,module,exports){
            module.exports =
            function(Promise, PromiseArray, apiRejection) {
            var util = _dereq_("./util");
            var RangeError = _dereq_("./errors").RangeError;
            var AggregateError = _dereq_("./errors").AggregateError;
            var isArray = util.isArray;
            var CANCELLATION = {};


            function SomePromiseArray(values) {
                this.constructor$(values);
                this._howMany = 0;
                this._unwrap = false;
                this._initialized = false;
            }
            util.inherits(SomePromiseArray, PromiseArray);

            SomePromiseArray.prototype._init = function () {
                if (!this._initialized) {
                    return;
                }
                if (this._howMany === 0) {
                    this._resolve([]);
                    return;
                }
                this._init$(undefined, -5);
                var isArrayResolved = isArray(this._values);
                if (!this._isResolved() &&
                    isArrayResolved &&
                    this._howMany > this._canPossiblyFulfill()) {
                    this._reject(this._getRangeError(this.length()));
                }
            };

            SomePromiseArray.prototype.init = function () {
                this._initialized = true;
                this._init();
            };

            SomePromiseArray.prototype.setUnwrap = function () {
                this._unwrap = true;
            };

            SomePromiseArray.prototype.howMany = function () {
                return this._howMany;
            };

            SomePromiseArray.prototype.setHowMany = function (count) {
                this._howMany = count;
            };

            SomePromiseArray.prototype._promiseFulfilled = function (value) {
                this._addFulfilled(value);
                if (this._fulfilled() === this.howMany()) {
                    this._values.length = this.howMany();
                    if (this.howMany() === 1 && this._unwrap) {
                        this._resolve(this._values[0]);
                    } else {
                        this._resolve(this._values);
                    }
                    return true;
                }
                return false;

            };
            SomePromiseArray.prototype._promiseRejected = function (reason) {
                this._addRejected(reason);
                return this._checkOutcome();
            };

            SomePromiseArray.prototype._promiseCancelled = function () {
                if (this._values instanceof Promise || this._values == null) {
                    return this._cancel();
                }
                this._addRejected(CANCELLATION);
                return this._checkOutcome();
            };

            SomePromiseArray.prototype._checkOutcome = function() {
                if (this.howMany() > this._canPossiblyFulfill()) {
                    var e = new AggregateError();
                    for (var i = this.length(); i < this._values.length; ++i) {
                        if (this._values[i] !== CANCELLATION) {
                            e.push(this._values[i]);
                        }
                    }
                    if (e.length > 0) {
                        this._reject(e);
                    } else {
                        this._cancel();
                    }
                    return true;
                }
                return false;
            };

            SomePromiseArray.prototype._fulfilled = function () {
                return this._totalResolved;
            };

            SomePromiseArray.prototype._rejected = function () {
                return this._values.length - this.length();
            };

            SomePromiseArray.prototype._addRejected = function (reason) {
                this._values.push(reason);
            };

            SomePromiseArray.prototype._addFulfilled = function (value) {
                this._values[this._totalResolved++] = value;
            };

            SomePromiseArray.prototype._canPossiblyFulfill = function () {
                return this.length() - this._rejected();
            };

            SomePromiseArray.prototype._getRangeError = function (count) {
                var message = "Input array must contain at least " +
                        this._howMany + " items but contains only " + count + " items";
                return new RangeError(message);
            };

            SomePromiseArray.prototype._resolveEmptyArray = function () {
                this._reject(this._getRangeError(0));
            };

            function some(promises, howMany) {
                if ((howMany | 0) !== howMany || howMany < 0) {
                    return apiRejection("expecting a positive integer\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
                }
                var ret = new SomePromiseArray(promises);
                var promise = ret.promise();
                ret.setHowMany(howMany);
                ret.init();
                return promise;
            }

            Promise.some = function (promises, howMany) {
                return some(promises, howMany);
            };

            Promise.prototype.some = function (howMany) {
                return some(this, howMany);
            };

            Promise._SomePromiseArray = SomePromiseArray;
            };

            },{"./errors":12,"./util":36}],32:[function(_dereq_,module,exports){
            module.exports = function(Promise) {
            function PromiseInspection(promise) {
                if (promise !== undefined) {
                    promise = promise._target();
                    this._bitField = promise._bitField;
                    this._settledValueField = promise._isFateSealed()
                        ? promise._settledValue() : undefined;
                }
                else {
                    this._bitField = 0;
                    this._settledValueField = undefined;
                }
            }

            PromiseInspection.prototype._settledValue = function() {
                return this._settledValueField;
            };

            var value = PromiseInspection.prototype.value = function () {
                if (!this.isFulfilled()) {
                    throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
                }
                return this._settledValue();
            };

            var reason = PromiseInspection.prototype.error =
            PromiseInspection.prototype.reason = function () {
                if (!this.isRejected()) {
                    throw new TypeError("cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
                }
                return this._settledValue();
            };

            var isFulfilled = PromiseInspection.prototype.isFulfilled = function() {
                return (this._bitField & 33554432) !== 0;
            };

            var isRejected = PromiseInspection.prototype.isRejected = function () {
                return (this._bitField & 16777216) !== 0;
            };

            var isPending = PromiseInspection.prototype.isPending = function () {
                return (this._bitField & 50397184) === 0;
            };

            var isResolved = PromiseInspection.prototype.isResolved = function () {
                return (this._bitField & 50331648) !== 0;
            };

            PromiseInspection.prototype.isCancelled = function() {
                return (this._bitField & 8454144) !== 0;
            };

            Promise.prototype.__isCancelled = function() {
                return (this._bitField & 65536) === 65536;
            };

            Promise.prototype._isCancelled = function() {
                return this._target().__isCancelled();
            };

            Promise.prototype.isCancelled = function() {
                return (this._target()._bitField & 8454144) !== 0;
            };

            Promise.prototype.isPending = function() {
                return isPending.call(this._target());
            };

            Promise.prototype.isRejected = function() {
                return isRejected.call(this._target());
            };

            Promise.prototype.isFulfilled = function() {
                return isFulfilled.call(this._target());
            };

            Promise.prototype.isResolved = function() {
                return isResolved.call(this._target());
            };

            Promise.prototype.value = function() {
                return value.call(this._target());
            };

            Promise.prototype.reason = function() {
                var target = this._target();
                target._unsetRejectionIsUnhandled();
                return reason.call(target);
            };

            Promise.prototype._value = function() {
                return this._settledValue();
            };

            Promise.prototype._reason = function() {
                this._unsetRejectionIsUnhandled();
                return this._settledValue();
            };

            Promise.PromiseInspection = PromiseInspection;
            };

            },{}],33:[function(_dereq_,module,exports){
            module.exports = function(Promise, INTERNAL) {
            var util = _dereq_("./util");
            var errorObj = util.errorObj;
            var isObject = util.isObject;

            function tryConvertToPromise(obj, context) {
                if (isObject(obj)) {
                    if (obj instanceof Promise) return obj;
                    var then = getThen(obj);
                    if (then === errorObj) {
                        if (context) context._pushContext();
                        var ret = Promise.reject(then.e);
                        if (context) context._popContext();
                        return ret;
                    } else if (typeof then === "function") {
                        if (isAnyBluebirdPromise(obj)) {
                            var ret = new Promise(INTERNAL);
                            obj._then(
                                ret._fulfill,
                                ret._reject,
                                undefined,
                                ret,
                                null
                            );
                            return ret;
                        }
                        return doThenable(obj, then, context);
                    }
                }
                return obj;
            }

            function doGetThen(obj) {
                return obj.then;
            }

            function getThen(obj) {
                try {
                    return doGetThen(obj);
                } catch (e) {
                    errorObj.e = e;
                    return errorObj;
                }
            }

            var hasProp = {}.hasOwnProperty;
            function isAnyBluebirdPromise(obj) {
                try {
                    return hasProp.call(obj, "_promise0");
                } catch (e) {
                    return false;
                }
            }

            function doThenable(x, then, context) {
                var promise = new Promise(INTERNAL);
                var ret = promise;
                if (context) context._pushContext();
                promise._captureStackTrace();
                if (context) context._popContext();
                var synchronous = true;
                var result = util.tryCatch(then).call(x, resolve, reject);
                synchronous = false;

                if (promise && result === errorObj) {
                    promise._rejectCallback(result.e, true, true);
                    promise = null;
                }

                function resolve(value) {
                    if (!promise) return;
                    promise._resolveCallback(value);
                    promise = null;
                }

                function reject(reason) {
                    if (!promise) return;
                    promise._rejectCallback(reason, synchronous, true);
                    promise = null;
                }
                return ret;
            }

            return tryConvertToPromise;
            };

            },{"./util":36}],34:[function(_dereq_,module,exports){
            module.exports = function(Promise, INTERNAL, debug) {
            var util = _dereq_("./util");
            var TimeoutError = Promise.TimeoutError;

            function HandleWrapper(handle)  {
                this.handle = handle;
            }

            HandleWrapper.prototype._resultCancelled = function() {
                clearTimeout(this.handle);
            };

            var afterValue = function(value) { return delay(+this).thenReturn(value); };
            var delay = Promise.delay = function (ms, value) {
                var ret;
                var handle;
                if (value !== undefined) {
                    ret = Promise.resolve(value)
                            ._then(afterValue, null, null, ms, undefined);
                    if (debug.cancellation() && value instanceof Promise) {
                        ret._setOnCancel(value);
                    }
                } else {
                    ret = new Promise(INTERNAL);
                    handle = setTimeout(function() { ret._fulfill(); }, +ms);
                    if (debug.cancellation()) {
                        ret._setOnCancel(new HandleWrapper(handle));
                    }
                    ret._captureStackTrace();
                }
                ret._setAsyncGuaranteed();
                return ret;
            };

            Promise.prototype.delay = function (ms) {
                return delay(ms, this);
            };

            var afterTimeout = function (promise, message, parent) {
                var err;
                if (typeof message !== "string") {
                    if (message instanceof Error) {
                        err = message;
                    } else {
                        err = new TimeoutError("operation timed out");
                    }
                } else {
                    err = new TimeoutError(message);
                }
                util.markAsOriginatingFromRejection(err);
                promise._attachExtraTrace(err);
                promise._reject(err);

                if (parent != null) {
                    parent.cancel();
                }
            };

            function successClear(value) {
                clearTimeout(this.handle);
                return value;
            }

            function failureClear(reason) {
                clearTimeout(this.handle);
                throw reason;
            }

            Promise.prototype.timeout = function (ms, message) {
                ms = +ms;
                var ret, parent;

                var handleWrapper = new HandleWrapper(setTimeout(function timeoutTimeout() {
                    if (ret.isPending()) {
                        afterTimeout(ret, message, parent);
                    }
                }, ms));

                if (debug.cancellation()) {
                    parent = this.then();
                    ret = parent._then(successClear, failureClear,
                                        undefined, handleWrapper, undefined);
                    ret._setOnCancel(handleWrapper);
                } else {
                    ret = this._then(successClear, failureClear,
                                        undefined, handleWrapper, undefined);
                }

                return ret;
            };

            };

            },{"./util":36}],35:[function(_dereq_,module,exports){
            module.exports = function (Promise, apiRejection, tryConvertToPromise,
                createContext, INTERNAL, debug) {
                var util = _dereq_("./util");
                var TypeError = _dereq_("./errors").TypeError;
                var inherits = _dereq_("./util").inherits;
                var errorObj = util.errorObj;
                var tryCatch = util.tryCatch;
                var NULL = {};

                function thrower(e) {
                    setTimeout(function(){throw e;}, 0);
                }

                function castPreservingDisposable(thenable) {
                    var maybePromise = tryConvertToPromise(thenable);
                    if (maybePromise !== thenable &&
                        typeof thenable._isDisposable === "function" &&
                        typeof thenable._getDisposer === "function" &&
                        thenable._isDisposable()) {
                        maybePromise._setDisposable(thenable._getDisposer());
                    }
                    return maybePromise;
                }
                function dispose(resources, inspection) {
                    var i = 0;
                    var len = resources.length;
                    var ret = new Promise(INTERNAL);
                    function iterator() {
                        if (i >= len) return ret._fulfill();
                        var maybePromise = castPreservingDisposable(resources[i++]);
                        if (maybePromise instanceof Promise &&
                            maybePromise._isDisposable()) {
                            try {
                                maybePromise = tryConvertToPromise(
                                    maybePromise._getDisposer().tryDispose(inspection),
                                    resources.promise);
                            } catch (e) {
                                return thrower(e);
                            }
                            if (maybePromise instanceof Promise) {
                                return maybePromise._then(iterator, thrower,
                                                          null, null, null);
                            }
                        }
                        iterator();
                    }
                    iterator();
                    return ret;
                }

                function Disposer(data, promise, context) {
                    this._data = data;
                    this._promise = promise;
                    this._context = context;
                }

                Disposer.prototype.data = function () {
                    return this._data;
                };

                Disposer.prototype.promise = function () {
                    return this._promise;
                };

                Disposer.prototype.resource = function () {
                    if (this.promise().isFulfilled()) {
                        return this.promise().value();
                    }
                    return NULL;
                };

                Disposer.prototype.tryDispose = function(inspection) {
                    var resource = this.resource();
                    var context = this._context;
                    if (context !== undefined) context._pushContext();
                    var ret = resource !== NULL
                        ? this.doDispose(resource, inspection) : null;
                    if (context !== undefined) context._popContext();
                    this._promise._unsetDisposable();
                    this._data = null;
                    return ret;
                };

                Disposer.isDisposer = function (d) {
                    return (d != null &&
                            typeof d.resource === "function" &&
                            typeof d.tryDispose === "function");
                };

                function FunctionDisposer(fn, promise, context) {
                    this.constructor$(fn, promise, context);
                }
                inherits(FunctionDisposer, Disposer);

                FunctionDisposer.prototype.doDispose = function (resource, inspection) {
                    var fn = this.data();
                    return fn.call(resource, resource, inspection);
                };

                function maybeUnwrapDisposer(value) {
                    if (Disposer.isDisposer(value)) {
                        this.resources[this.index]._setDisposable(value);
                        return value.promise();
                    }
                    return value;
                }

                function ResourceList(length) {
                    this.length = length;
                    this.promise = null;
                    this[length-1] = null;
                }

                ResourceList.prototype._resultCancelled = function() {
                    var len = this.length;
                    for (var i = 0; i < len; ++i) {
                        var item = this[i];
                        if (item instanceof Promise) {
                            item.cancel();
                        }
                    }
                };

                Promise.using = function () {
                    var len = arguments.length;
                    if (len < 2) return apiRejection(
                                    "you must pass at least 2 arguments to Promise.using");
                    var fn = arguments[len - 1];
                    if (typeof fn !== "function") {
                        return apiRejection("expecting a function but got " + util.classString(fn));
                    }
                    var input;
                    var spreadArgs = true;
                    if (len === 2 && Array.isArray(arguments[0])) {
                        input = arguments[0];
                        len = input.length;
                        spreadArgs = false;
                    } else {
                        input = arguments;
                        len--;
                    }
                    var resources = new ResourceList(len);
                    for (var i = 0; i < len; ++i) {
                        var resource = input[i];
                        if (Disposer.isDisposer(resource)) {
                            var disposer = resource;
                            resource = resource.promise();
                            resource._setDisposable(disposer);
                        } else {
                            var maybePromise = tryConvertToPromise(resource);
                            if (maybePromise instanceof Promise) {
                                resource =
                                    maybePromise._then(maybeUnwrapDisposer, null, null, {
                                        resources: resources,
                                        index: i
                                }, undefined);
                            }
                        }
                        resources[i] = resource;
                    }

                    var reflectedResources = new Array(resources.length);
                    for (var i = 0; i < reflectedResources.length; ++i) {
                        reflectedResources[i] = Promise.resolve(resources[i]).reflect();
                    }

                    var resultPromise = Promise.all(reflectedResources)
                        .then(function(inspections) {
                            for (var i = 0; i < inspections.length; ++i) {
                                var inspection = inspections[i];
                                if (inspection.isRejected()) {
                                    errorObj.e = inspection.error();
                                    return errorObj;
                                } else if (!inspection.isFulfilled()) {
                                    resultPromise.cancel();
                                    return;
                                }
                                inspections[i] = inspection.value();
                            }
                            promise._pushContext();

                            fn = tryCatch(fn);
                            var ret = spreadArgs
                                ? fn.apply(undefined, inspections) : fn(inspections);
                            var promiseCreated = promise._popContext();
                            debug.checkForgottenReturns(
                                ret, promiseCreated, "Promise.using", promise);
                            return ret;
                        });

                    var promise = resultPromise.lastly(function() {
                        var inspection = new Promise.PromiseInspection(resultPromise);
                        return dispose(resources, inspection);
                    });
                    resources.promise = promise;
                    promise._setOnCancel(resources);
                    return promise;
                };

                Promise.prototype._setDisposable = function (disposer) {
                    this._bitField = this._bitField | 131072;
                    this._disposer = disposer;
                };

                Promise.prototype._isDisposable = function () {
                    return (this._bitField & 131072) > 0;
                };

                Promise.prototype._getDisposer = function () {
                    return this._disposer;
                };

                Promise.prototype._unsetDisposable = function () {
                    this._bitField = this._bitField & (~131072);
                    this._disposer = undefined;
                };

                Promise.prototype.disposer = function (fn) {
                    if (typeof fn === "function") {
                        return new FunctionDisposer(fn, this, createContext());
                    }
                    throw new TypeError();
                };

            };

            },{"./errors":12,"./util":36}],36:[function(_dereq_,module,exports){
            var es5 = _dereq_("./es5");
            var canEvaluate = typeof navigator == "undefined";

            var errorObj = {e: {}};
            var tryCatchTarget;
            var globalObject = typeof self !== "undefined" ? self :
                typeof window !== "undefined" ? window :
                typeof commonjsGlobal !== "undefined" ? commonjsGlobal :
                this !== undefined ? this : null;

            function tryCatcher() {
                try {
                    var target = tryCatchTarget;
                    tryCatchTarget = null;
                    return target.apply(this, arguments);
                } catch (e) {
                    errorObj.e = e;
                    return errorObj;
                }
            }
            function tryCatch(fn) {
                tryCatchTarget = fn;
                return tryCatcher;
            }

            var inherits = function(Child, Parent) {
                var hasProp = {}.hasOwnProperty;

                function T() {
                    this.constructor = Child;
                    this.constructor$ = Parent;
                    for (var propertyName in Parent.prototype) {
                        if (hasProp.call(Parent.prototype, propertyName) &&
                            propertyName.charAt(propertyName.length-1) !== "$"
                       ) {
                            this[propertyName + "$"] = Parent.prototype[propertyName];
                        }
                    }
                }
                T.prototype = Parent.prototype;
                Child.prototype = new T();
                return Child.prototype;
            };


            function isPrimitive(val) {
                return val == null || val === true || val === false ||
                    typeof val === "string" || typeof val === "number";

            }

            function isObject(value) {
                return typeof value === "function" ||
                       typeof value === "object" && value !== null;
            }

            function maybeWrapAsError(maybeError) {
                if (!isPrimitive(maybeError)) return maybeError;

                return new Error(safeToString(maybeError));
            }

            function withAppended(target, appendee) {
                var len = target.length;
                var ret = new Array(len + 1);
                var i;
                for (i = 0; i < len; ++i) {
                    ret[i] = target[i];
                }
                ret[i] = appendee;
                return ret;
            }

            function getDataPropertyOrDefault(obj, key, defaultValue) {
                if (es5.isES5) {
                    var desc = Object.getOwnPropertyDescriptor(obj, key);

                    if (desc != null) {
                        return desc.get == null && desc.set == null
                                ? desc.value
                                : defaultValue;
                    }
                } else {
                    return {}.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
                }
            }

            function notEnumerableProp(obj, name, value) {
                if (isPrimitive(obj)) return obj;
                var descriptor = {
                    value: value,
                    configurable: true,
                    enumerable: false,
                    writable: true
                };
                es5.defineProperty(obj, name, descriptor);
                return obj;
            }

            function thrower(r) {
                throw r;
            }

            var inheritedDataKeys = (function() {
                var excludedPrototypes = [
                    Array.prototype,
                    Object.prototype,
                    Function.prototype
                ];

                var isExcludedProto = function(val) {
                    for (var i = 0; i < excludedPrototypes.length; ++i) {
                        if (excludedPrototypes[i] === val) {
                            return true;
                        }
                    }
                    return false;
                };

                if (es5.isES5) {
                    var getKeys = Object.getOwnPropertyNames;
                    return function(obj) {
                        var ret = [];
                        var visitedKeys = Object.create(null);
                        while (obj != null && !isExcludedProto(obj)) {
                            var keys;
                            try {
                                keys = getKeys(obj);
                            } catch (e) {
                                return ret;
                            }
                            for (var i = 0; i < keys.length; ++i) {
                                var key = keys[i];
                                if (visitedKeys[key]) continue;
                                visitedKeys[key] = true;
                                var desc = Object.getOwnPropertyDescriptor(obj, key);
                                if (desc != null && desc.get == null && desc.set == null) {
                                    ret.push(key);
                                }
                            }
                            obj = es5.getPrototypeOf(obj);
                        }
                        return ret;
                    };
                } else {
                    var hasProp = {}.hasOwnProperty;
                    return function(obj) {
                        if (isExcludedProto(obj)) return [];
                        var ret = [];

                        /*jshint forin:false */
                        enumeration: for (var key in obj) {
                            if (hasProp.call(obj, key)) {
                                ret.push(key);
                            } else {
                                for (var i = 0; i < excludedPrototypes.length; ++i) {
                                    if (hasProp.call(excludedPrototypes[i], key)) {
                                        continue enumeration;
                                    }
                                }
                                ret.push(key);
                            }
                        }
                        return ret;
                    };
                }

            })();

            var thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;
            function isClass(fn) {
                try {
                    if (typeof fn === "function") {
                        var keys = es5.names(fn.prototype);

                        var hasMethods = es5.isES5 && keys.length > 1;
                        var hasMethodsOtherThanConstructor = keys.length > 0 &&
                            !(keys.length === 1 && keys[0] === "constructor");
                        var hasThisAssignmentAndStaticMethods =
                            thisAssignmentPattern.test(fn + "") && es5.names(fn).length > 0;

                        if (hasMethods || hasMethodsOtherThanConstructor ||
                            hasThisAssignmentAndStaticMethods) {
                            return true;
                        }
                    }
                    return false;
                } catch (e) {
                    return false;
                }
            }

            function toFastProperties(obj) {
                return obj;
                eval(obj);
            }

            var rident = /^[a-z$_][a-z$_0-9]*$/i;
            function isIdentifier(str) {
                return rident.test(str);
            }

            function filledRange(count, prefix, suffix) {
                var ret = new Array(count);
                for(var i = 0; i < count; ++i) {
                    ret[i] = prefix + i + suffix;
                }
                return ret;
            }

            function safeToString(obj) {
                try {
                    return obj + "";
                } catch (e) {
                    return "[no string representation]";
                }
            }

            function isError(obj) {
                return obj instanceof Error ||
                    (obj !== null &&
                       typeof obj === "object" &&
                       typeof obj.message === "string" &&
                       typeof obj.name === "string");
            }

            function markAsOriginatingFromRejection(e) {
                try {
                    notEnumerableProp(e, "isOperational", true);
                }
                catch(ignore) {}
            }

            function originatesFromRejection(e) {
                if (e == null) return false;
                return ((e instanceof Error["__BluebirdErrorTypes__"].OperationalError) ||
                    e["isOperational"] === true);
            }

            function canAttachTrace(obj) {
                return isError(obj) && es5.propertyIsWritable(obj, "stack");
            }

            var ensureErrorObject = (function() {
                if (!("stack" in new Error())) {
                    return function(value) {
                        if (canAttachTrace(value)) return value;
                        try {throw new Error(safeToString(value));}
                        catch(err) {return err;}
                    };
                } else {
                    return function(value) {
                        if (canAttachTrace(value)) return value;
                        return new Error(safeToString(value));
                    };
                }
            })();

            function classString(obj) {
                return {}.toString.call(obj);
            }

            function copyDescriptors(from, to, filter) {
                var keys = es5.names(from);
                for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    if (filter(key)) {
                        try {
                            es5.defineProperty(to, key, es5.getDescriptor(from, key));
                        } catch (ignore) {}
                    }
                }
            }

            var asArray = function(v) {
                if (es5.isArray(v)) {
                    return v;
                }
                return null;
            };

            if (typeof Symbol !== "undefined" && Symbol.iterator) {
                var ArrayFrom = typeof Array.from === "function" ? function(v) {
                    return Array.from(v);
                } : function(v) {
                    var ret = [];
                    var it = v[Symbol.iterator]();
                    var itResult;
                    while (!((itResult = it.next()).done)) {
                        ret.push(itResult.value);
                    }
                    return ret;
                };

                asArray = function(v) {
                    if (es5.isArray(v)) {
                        return v;
                    } else if (v != null && typeof v[Symbol.iterator] === "function") {
                        return ArrayFrom(v);
                    }
                    return null;
                };
            }

            var isNode = typeof process !== "undefined" &&
                    classString(process).toLowerCase() === "[object process]";

            var hasEnvVariables = typeof process !== "undefined" &&
                typeof process.env !== "undefined";

            function env$$1(key) {
                return hasEnvVariables ? process.env[key] : undefined;
            }

            function getNativePromise() {
                if (typeof Promise === "function") {
                    try {
                        var promise = new Promise(function(){});
                        if ({}.toString.call(promise) === "[object Promise]") {
                            return Promise;
                        }
                    } catch (e) {}
                }
            }

            function domainBind(self, cb) {
                return self.bind(cb);
            }

            var ret = {
                isClass: isClass,
                isIdentifier: isIdentifier,
                inheritedDataKeys: inheritedDataKeys,
                getDataPropertyOrDefault: getDataPropertyOrDefault,
                thrower: thrower,
                isArray: es5.isArray,
                asArray: asArray,
                notEnumerableProp: notEnumerableProp,
                isPrimitive: isPrimitive,
                isObject: isObject,
                isError: isError,
                canEvaluate: canEvaluate,
                errorObj: errorObj,
                tryCatch: tryCatch,
                inherits: inherits,
                withAppended: withAppended,
                maybeWrapAsError: maybeWrapAsError,
                toFastProperties: toFastProperties,
                filledRange: filledRange,
                toString: safeToString,
                canAttachTrace: canAttachTrace,
                ensureErrorObject: ensureErrorObject,
                originatesFromRejection: originatesFromRejection,
                markAsOriginatingFromRejection: markAsOriginatingFromRejection,
                classString: classString,
                copyDescriptors: copyDescriptors,
                hasDevTools: typeof chrome !== "undefined" && chrome &&
                             typeof chrome.loadTimes === "function",
                isNode: isNode,
                hasEnvVariables: hasEnvVariables,
                env: env$$1,
                global: globalObject,
                getNativePromise: getNativePromise,
                domainBind: domainBind
            };
            ret.isRecentNode = ret.isNode && (function() {
                var version$$1 = process.versions.node.split(".").map(Number);
                return (version$$1[0] === 0 && version$$1[1] > 10) || (version$$1[0] > 0);
            })();

            if (ret.isNode) ret.toFastProperties(process);

            try {throw new Error(); } catch (e) {ret.lastLineError = e;}
            module.exports = ret;

            },{"./es5":13}]},{},[4])(4)
            });if (typeof window !== 'undefined' && window !== null) {                               window.P = window.Promise;                                                     } else if (typeof self !== 'undefined' && self !== null) {                             self.P = self.Promise;                                                         }
            });

            var lookup = [];
            var revLookup = [];
            var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
            var inited = false;
            function init () {
              inited = true;
              var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
              for (var i = 0, len = code.length; i < len; ++i) {
                lookup[i] = code[i];
                revLookup[code.charCodeAt(i)] = i;
              }

              revLookup['-'.charCodeAt(0)] = 62;
              revLookup['_'.charCodeAt(0)] = 63;
            }

            function toByteArray (b64) {
              if (!inited) {
                init();
              }
              var i, j, l, tmp, placeHolders, arr;
              var len = b64.length;

              if (len % 4 > 0) {
                throw new Error('Invalid string. Length must be a multiple of 4')
              }

              // the number of equal signs (place holders)
              // if there are two placeholders, than the two characters before it
              // represent one byte
              // if there is only one, then the three characters before it represent 2 bytes
              // this is just a cheap hack to not do indexOf twice
              placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

              // base64 is 4/3 + up to two characters of the original data
              arr = new Arr(len * 3 / 4 - placeHolders);

              // if there are placeholders, only get up to the last complete 4 chars
              l = placeHolders > 0 ? len - 4 : len;

              var L = 0;

              for (i = 0, j = 0; i < l; i += 4, j += 3) {
                tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
                arr[L++] = (tmp >> 16) & 0xFF;
                arr[L++] = (tmp >> 8) & 0xFF;
                arr[L++] = tmp & 0xFF;
              }

              if (placeHolders === 2) {
                tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
                arr[L++] = tmp & 0xFF;
              } else if (placeHolders === 1) {
                tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
                arr[L++] = (tmp >> 8) & 0xFF;
                arr[L++] = tmp & 0xFF;
              }

              return arr
            }

            function tripletToBase64 (num) {
              return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
            }

            function encodeChunk (uint8, start, end) {
              var tmp;
              var output = [];
              for (var i = start; i < end; i += 3) {
                tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
                output.push(tripletToBase64(tmp));
              }
              return output.join('')
            }

            function fromByteArray (uint8) {
              if (!inited) {
                init();
              }
              var tmp;
              var len = uint8.length;
              var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
              var output = '';
              var parts = [];
              var maxChunkLength = 16383; // must be multiple of 3

              // go through the array every three bytes, we'll deal with trailing stuff later
              for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
                parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
              }

              // pad the end with zeros, but make sure to not forget the extra bytes
              if (extraBytes === 1) {
                tmp = uint8[len - 1];
                output += lookup[tmp >> 2];
                output += lookup[(tmp << 4) & 0x3F];
                output += '==';
              } else if (extraBytes === 2) {
                tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
                output += lookup[tmp >> 10];
                output += lookup[(tmp >> 4) & 0x3F];
                output += lookup[(tmp << 2) & 0x3F];
                output += '=';
              }

              parts.push(output);

              return parts.join('')
            }

            function read (buffer, offset, isLE, mLen, nBytes) {
              var e, m;
              var eLen = nBytes * 8 - mLen - 1;
              var eMax = (1 << eLen) - 1;
              var eBias = eMax >> 1;
              var nBits = -7;
              var i = isLE ? (nBytes - 1) : 0;
              var d = isLE ? -1 : 1;
              var s = buffer[offset + i];

              i += d;

              e = s & ((1 << (-nBits)) - 1);
              s >>= (-nBits);
              nBits += eLen;
              for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

              m = e & ((1 << (-nBits)) - 1);
              e >>= (-nBits);
              nBits += mLen;
              for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

              if (e === 0) {
                e = 1 - eBias;
              } else if (e === eMax) {
                return m ? NaN : ((s ? -1 : 1) * Infinity)
              } else {
                m = m + Math.pow(2, mLen);
                e = e - eBias;
              }
              return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
            }

            function write (buffer, value, offset, isLE, mLen, nBytes) {
              var e, m, c;
              var eLen = nBytes * 8 - mLen - 1;
              var eMax = (1 << eLen) - 1;
              var eBias = eMax >> 1;
              var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
              var i = isLE ? 0 : (nBytes - 1);
              var d = isLE ? 1 : -1;
              var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

              value = Math.abs(value);

              if (isNaN(value) || value === Infinity) {
                m = isNaN(value) ? 1 : 0;
                e = eMax;
              } else {
                e = Math.floor(Math.log(value) / Math.LN2);
                if (value * (c = Math.pow(2, -e)) < 1) {
                  e--;
                  c *= 2;
                }
                if (e + eBias >= 1) {
                  value += rt / c;
                } else {
                  value += rt * Math.pow(2, 1 - eBias);
                }
                if (value * c >= 2) {
                  e++;
                  c /= 2;
                }

                if (e + eBias >= eMax) {
                  m = 0;
                  e = eMax;
                } else if (e + eBias >= 1) {
                  m = (value * c - 1) * Math.pow(2, mLen);
                  e = e + eBias;
                } else {
                  m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                  e = 0;
                }
              }

              for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

              e = (e << mLen) | m;
              eLen += mLen;
              for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

              buffer[offset + i - d] |= s * 128;
            }

            var toString = {}.toString;

            var isArray = Array.isArray || function (arr) {
              return toString.call(arr) == '[object Array]';
            };

            var INSPECT_MAX_BYTES = 50;

            /**
             * If `Buffer.TYPED_ARRAY_SUPPORT`:
             *   === true    Use Uint8Array implementation (fastest)
             *   === false   Use Object implementation (most compatible, even IE6)
             *
             * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
             * Opera 11.6+, iOS 4.2+.
             *
             * Due to various browser bugs, sometimes the Object implementation will be used even
             * when the browser supports typed arrays.
             *
             * Note:
             *
             *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
             *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
             *
             *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
             *
             *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
             *     incorrect length in some situations.

             * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
             * get the Object implementation, which is slower but behaves correctly.
             */
            Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
              ? global$1.TYPED_ARRAY_SUPPORT
              : true;

            function kMaxLength () {
              return Buffer.TYPED_ARRAY_SUPPORT
                ? 0x7fffffff
                : 0x3fffffff
            }

            function createBuffer (that, length) {
              if (kMaxLength() < length) {
                throw new RangeError('Invalid typed array length')
              }
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                // Return an augmented `Uint8Array` instance, for best performance
                that = new Uint8Array(length);
                that.__proto__ = Buffer.prototype;
              } else {
                // Fallback: Return an object instance of the Buffer class
                if (that === null) {
                  that = new Buffer(length);
                }
                that.length = length;
              }

              return that
            }

            /**
             * The Buffer constructor returns instances of `Uint8Array` that have their
             * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
             * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
             * and the `Uint8Array` methods. Square bracket notation works as expected -- it
             * returns a single octet.
             *
             * The `Uint8Array` prototype remains unmodified.
             */

            function Buffer (arg, encodingOrOffset, length) {
              if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
                return new Buffer(arg, encodingOrOffset, length)
              }

              // Common case.
              if (typeof arg === 'number') {
                if (typeof encodingOrOffset === 'string') {
                  throw new Error(
                    'If encoding is specified then the first argument must be a string'
                  )
                }
                return allocUnsafe(this, arg)
              }
              return from(this, arg, encodingOrOffset, length)
            }

            Buffer.poolSize = 8192; // not used by this implementation

            // TODO: Legacy, not needed anymore. Remove in next major version.
            Buffer._augment = function (arr) {
              arr.__proto__ = Buffer.prototype;
              return arr
            };

            function from (that, value, encodingOrOffset, length) {
              if (typeof value === 'number') {
                throw new TypeError('"value" argument must not be a number')
              }

              if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
                return fromArrayBuffer(that, value, encodingOrOffset, length)
              }

              if (typeof value === 'string') {
                return fromString(that, value, encodingOrOffset)
              }

              return fromObject(that, value)
            }

            /**
             * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
             * if value is a number.
             * Buffer.from(str[, encoding])
             * Buffer.from(array)
             * Buffer.from(buffer)
             * Buffer.from(arrayBuffer[, byteOffset[, length]])
             **/
            Buffer.from = function (value, encodingOrOffset, length) {
              return from(null, value, encodingOrOffset, length)
            };

            if (Buffer.TYPED_ARRAY_SUPPORT) {
              Buffer.prototype.__proto__ = Uint8Array.prototype;
              Buffer.__proto__ = Uint8Array;
            }

            function assertSize (size) {
              if (typeof size !== 'number') {
                throw new TypeError('"size" argument must be a number')
              } else if (size < 0) {
                throw new RangeError('"size" argument must not be negative')
              }
            }

            function alloc (that, size, fill, encoding) {
              assertSize(size);
              if (size <= 0) {
                return createBuffer(that, size)
              }
              if (fill !== undefined) {
                // Only pay attention to encoding if it's a string. This
                // prevents accidentally sending in a number that would
                // be interpretted as a start offset.
                return typeof encoding === 'string'
                  ? createBuffer(that, size).fill(fill, encoding)
                  : createBuffer(that, size).fill(fill)
              }
              return createBuffer(that, size)
            }

            /**
             * Creates a new filled Buffer instance.
             * alloc(size[, fill[, encoding]])
             **/
            Buffer.alloc = function (size, fill, encoding) {
              return alloc(null, size, fill, encoding)
            };

            function allocUnsafe (that, size) {
              assertSize(size);
              that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
              if (!Buffer.TYPED_ARRAY_SUPPORT) {
                for (var i = 0; i < size; ++i) {
                  that[i] = 0;
                }
              }
              return that
            }

            /**
             * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
             * */
            Buffer.allocUnsafe = function (size) {
              return allocUnsafe(null, size)
            };
            /**
             * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
             */
            Buffer.allocUnsafeSlow = function (size) {
              return allocUnsafe(null, size)
            };

            function fromString (that, string, encoding) {
              if (typeof encoding !== 'string' || encoding === '') {
                encoding = 'utf8';
              }

              if (!Buffer.isEncoding(encoding)) {
                throw new TypeError('"encoding" must be a valid string encoding')
              }

              var length = byteLength(string, encoding) | 0;
              that = createBuffer(that, length);

              var actual = that.write(string, encoding);

              if (actual !== length) {
                // Writing a hex string, for example, that contains invalid characters will
                // cause everything after the first invalid character to be ignored. (e.g.
                // 'abxxcd' will be treated as 'ab')
                that = that.slice(0, actual);
              }

              return that
            }

            function fromArrayLike (that, array) {
              var length = array.length < 0 ? 0 : checked(array.length) | 0;
              that = createBuffer(that, length);
              for (var i = 0; i < length; i += 1) {
                that[i] = array[i] & 255;
              }
              return that
            }

            function fromArrayBuffer (that, array, byteOffset, length) {
              array.byteLength; // this throws if `array` is not a valid ArrayBuffer

              if (byteOffset < 0 || array.byteLength < byteOffset) {
                throw new RangeError('\'offset\' is out of bounds')
              }

              if (array.byteLength < byteOffset + (length || 0)) {
                throw new RangeError('\'length\' is out of bounds')
              }

              if (byteOffset === undefined && length === undefined) {
                array = new Uint8Array(array);
              } else if (length === undefined) {
                array = new Uint8Array(array, byteOffset);
              } else {
                array = new Uint8Array(array, byteOffset, length);
              }

              if (Buffer.TYPED_ARRAY_SUPPORT) {
                // Return an augmented `Uint8Array` instance, for best performance
                that = array;
                that.__proto__ = Buffer.prototype;
              } else {
                // Fallback: Return an object instance of the Buffer class
                that = fromArrayLike(that, array);
              }
              return that
            }

            function fromObject (that, obj) {
              if (internalIsBuffer(obj)) {
                var len = checked(obj.length) | 0;
                that = createBuffer(that, len);

                if (that.length === 0) {
                  return that
                }

                obj.copy(that, 0, 0, len);
                return that
              }

              if (obj) {
                if ((typeof ArrayBuffer !== 'undefined' &&
                    obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
                  if (typeof obj.length !== 'number' || isnan(obj.length)) {
                    return createBuffer(that, 0)
                  }
                  return fromArrayLike(that, obj)
                }

                if (obj.type === 'Buffer' && isArray(obj.data)) {
                  return fromArrayLike(that, obj.data)
                }
              }

              throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
            }

            function checked (length) {
              // Note: cannot use `length < kMaxLength()` here because that fails when
              // length is NaN (which is otherwise coerced to zero.)
              if (length >= kMaxLength()) {
                throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                                     'size: 0x' + kMaxLength().toString(16) + ' bytes')
              }
              return length | 0
            }
            Buffer.isBuffer = isBuffer;
            function internalIsBuffer (b) {
              return !!(b != null && b._isBuffer)
            }

            Buffer.compare = function compare (a, b) {
              if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
                throw new TypeError('Arguments must be Buffers')
              }

              if (a === b) return 0

              var x = a.length;
              var y = b.length;

              for (var i = 0, len = Math.min(x, y); i < len; ++i) {
                if (a[i] !== b[i]) {
                  x = a[i];
                  y = b[i];
                  break
                }
              }

              if (x < y) return -1
              if (y < x) return 1
              return 0
            };

            Buffer.isEncoding = function isEncoding (encoding) {
              switch (String(encoding).toLowerCase()) {
                case 'hex':
                case 'utf8':
                case 'utf-8':
                case 'ascii':
                case 'latin1':
                case 'binary':
                case 'base64':
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return true
                default:
                  return false
              }
            };

            Buffer.concat = function concat (list, length) {
              if (!isArray(list)) {
                throw new TypeError('"list" argument must be an Array of Buffers')
              }

              if (list.length === 0) {
                return Buffer.alloc(0)
              }

              var i;
              if (length === undefined) {
                length = 0;
                for (i = 0; i < list.length; ++i) {
                  length += list[i].length;
                }
              }

              var buffer = Buffer.allocUnsafe(length);
              var pos = 0;
              for (i = 0; i < list.length; ++i) {
                var buf = list[i];
                if (!internalIsBuffer(buf)) {
                  throw new TypeError('"list" argument must be an Array of Buffers')
                }
                buf.copy(buffer, pos);
                pos += buf.length;
              }
              return buffer
            };

            function byteLength (string, encoding) {
              if (internalIsBuffer(string)) {
                return string.length
              }
              if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
                  (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
                return string.byteLength
              }
              if (typeof string !== 'string') {
                string = '' + string;
              }

              var len = string.length;
              if (len === 0) return 0

              // Use a for loop to avoid recursion
              var loweredCase = false;
              for (;;) {
                switch (encoding) {
                  case 'ascii':
                  case 'latin1':
                  case 'binary':
                    return len
                  case 'utf8':
                  case 'utf-8':
                  case undefined:
                    return utf8ToBytes(string).length
                  case 'ucs2':
                  case 'ucs-2':
                  case 'utf16le':
                  case 'utf-16le':
                    return len * 2
                  case 'hex':
                    return len >>> 1
                  case 'base64':
                    return base64ToBytes(string).length
                  default:
                    if (loweredCase) return utf8ToBytes(string).length // assume utf8
                    encoding = ('' + encoding).toLowerCase();
                    loweredCase = true;
                }
              }
            }
            Buffer.byteLength = byteLength;

            function slowToString (encoding, start, end) {
              var loweredCase = false;

              // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
              // property of a typed array.

              // This behaves neither like String nor Uint8Array in that we set start/end
              // to their upper/lower bounds if the value passed is out of range.
              // undefined is handled specially as per ECMA-262 6th Edition,
              // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
              if (start === undefined || start < 0) {
                start = 0;
              }
              // Return early if start > this.length. Done here to prevent potential uint32
              // coercion fail below.
              if (start > this.length) {
                return ''
              }

              if (end === undefined || end > this.length) {
                end = this.length;
              }

              if (end <= 0) {
                return ''
              }

              // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
              end >>>= 0;
              start >>>= 0;

              if (end <= start) {
                return ''
              }

              if (!encoding) encoding = 'utf8';

              while (true) {
                switch (encoding) {
                  case 'hex':
                    return hexSlice(this, start, end)

                  case 'utf8':
                  case 'utf-8':
                    return utf8Slice(this, start, end)

                  case 'ascii':
                    return asciiSlice(this, start, end)

                  case 'latin1':
                  case 'binary':
                    return latin1Slice(this, start, end)

                  case 'base64':
                    return base64Slice(this, start, end)

                  case 'ucs2':
                  case 'ucs-2':
                  case 'utf16le':
                  case 'utf-16le':
                    return utf16leSlice(this, start, end)

                  default:
                    if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                    encoding = (encoding + '').toLowerCase();
                    loweredCase = true;
                }
              }
            }

            // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
            // Buffer instances.
            Buffer.prototype._isBuffer = true;

            function swap (b, n, m) {
              var i = b[n];
              b[n] = b[m];
              b[m] = i;
            }

            Buffer.prototype.swap16 = function swap16 () {
              var len = this.length;
              if (len % 2 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 16-bits')
              }
              for (var i = 0; i < len; i += 2) {
                swap(this, i, i + 1);
              }
              return this
            };

            Buffer.prototype.swap32 = function swap32 () {
              var len = this.length;
              if (len % 4 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 32-bits')
              }
              for (var i = 0; i < len; i += 4) {
                swap(this, i, i + 3);
                swap(this, i + 1, i + 2);
              }
              return this
            };

            Buffer.prototype.swap64 = function swap64 () {
              var len = this.length;
              if (len % 8 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 64-bits')
              }
              for (var i = 0; i < len; i += 8) {
                swap(this, i, i + 7);
                swap(this, i + 1, i + 6);
                swap(this, i + 2, i + 5);
                swap(this, i + 3, i + 4);
              }
              return this
            };

            Buffer.prototype.toString = function toString () {
              var length = this.length | 0;
              if (length === 0) return ''
              if (arguments.length === 0) return utf8Slice(this, 0, length)
              return slowToString.apply(this, arguments)
            };

            Buffer.prototype.equals = function equals (b) {
              if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
              if (this === b) return true
              return Buffer.compare(this, b) === 0
            };

            Buffer.prototype.inspect = function inspect () {
              var str = '';
              var max = INSPECT_MAX_BYTES;
              if (this.length > 0) {
                str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
                if (this.length > max) str += ' ... ';
              }
              return '<Buffer ' + str + '>'
            };

            Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
              if (!internalIsBuffer(target)) {
                throw new TypeError('Argument must be a Buffer')
              }

              if (start === undefined) {
                start = 0;
              }
              if (end === undefined) {
                end = target ? target.length : 0;
              }
              if (thisStart === undefined) {
                thisStart = 0;
              }
              if (thisEnd === undefined) {
                thisEnd = this.length;
              }

              if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
                throw new RangeError('out of range index')
              }

              if (thisStart >= thisEnd && start >= end) {
                return 0
              }
              if (thisStart >= thisEnd) {
                return -1
              }
              if (start >= end) {
                return 1
              }

              start >>>= 0;
              end >>>= 0;
              thisStart >>>= 0;
              thisEnd >>>= 0;

              if (this === target) return 0

              var x = thisEnd - thisStart;
              var y = end - start;
              var len = Math.min(x, y);

              var thisCopy = this.slice(thisStart, thisEnd);
              var targetCopy = target.slice(start, end);

              for (var i = 0; i < len; ++i) {
                if (thisCopy[i] !== targetCopy[i]) {
                  x = thisCopy[i];
                  y = targetCopy[i];
                  break
                }
              }

              if (x < y) return -1
              if (y < x) return 1
              return 0
            };

            // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
            // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
            //
            // Arguments:
            // - buffer - a Buffer to search
            // - val - a string, Buffer, or number
            // - byteOffset - an index into `buffer`; will be clamped to an int32
            // - encoding - an optional encoding, relevant is val is a string
            // - dir - true for indexOf, false for lastIndexOf
            function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
              // Empty buffer means no match
              if (buffer.length === 0) return -1

              // Normalize byteOffset
              if (typeof byteOffset === 'string') {
                encoding = byteOffset;
                byteOffset = 0;
              } else if (byteOffset > 0x7fffffff) {
                byteOffset = 0x7fffffff;
              } else if (byteOffset < -0x80000000) {
                byteOffset = -0x80000000;
              }
              byteOffset = +byteOffset;  // Coerce to Number.
              if (isNaN(byteOffset)) {
                // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
                byteOffset = dir ? 0 : (buffer.length - 1);
              }

              // Normalize byteOffset: negative offsets start from the end of the buffer
              if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
              if (byteOffset >= buffer.length) {
                if (dir) return -1
                else byteOffset = buffer.length - 1;
              } else if (byteOffset < 0) {
                if (dir) byteOffset = 0;
                else return -1
              }

              // Normalize val
              if (typeof val === 'string') {
                val = Buffer.from(val, encoding);
              }

              // Finally, search either indexOf (if dir is true) or lastIndexOf
              if (internalIsBuffer(val)) {
                // Special case: looking for empty string/buffer always fails
                if (val.length === 0) {
                  return -1
                }
                return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
              } else if (typeof val === 'number') {
                val = val & 0xFF; // Search for a byte value [0-255]
                if (Buffer.TYPED_ARRAY_SUPPORT &&
                    typeof Uint8Array.prototype.indexOf === 'function') {
                  if (dir) {
                    return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
                  } else {
                    return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
                  }
                }
                return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
              }

              throw new TypeError('val must be string, number or Buffer')
            }

            function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
              var indexSize = 1;
              var arrLength = arr.length;
              var valLength = val.length;

              if (encoding !== undefined) {
                encoding = String(encoding).toLowerCase();
                if (encoding === 'ucs2' || encoding === 'ucs-2' ||
                    encoding === 'utf16le' || encoding === 'utf-16le') {
                  if (arr.length < 2 || val.length < 2) {
                    return -1
                  }
                  indexSize = 2;
                  arrLength /= 2;
                  valLength /= 2;
                  byteOffset /= 2;
                }
              }

              function read$$1 (buf, i) {
                if (indexSize === 1) {
                  return buf[i]
                } else {
                  return buf.readUInt16BE(i * indexSize)
                }
              }

              var i;
              if (dir) {
                var foundIndex = -1;
                for (i = byteOffset; i < arrLength; i++) {
                  if (read$$1(arr, i) === read$$1(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                    if (foundIndex === -1) foundIndex = i;
                    if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
                  } else {
                    if (foundIndex !== -1) i -= i - foundIndex;
                    foundIndex = -1;
                  }
                }
              } else {
                if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
                for (i = byteOffset; i >= 0; i--) {
                  var found = true;
                  for (var j = 0; j < valLength; j++) {
                    if (read$$1(arr, i + j) !== read$$1(val, j)) {
                      found = false;
                      break
                    }
                  }
                  if (found) return i
                }
              }

              return -1
            }

            Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
              return this.indexOf(val, byteOffset, encoding) !== -1
            };

            Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
              return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
            };

            Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
              return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
            };

            function hexWrite (buf, string, offset, length) {
              offset = Number(offset) || 0;
              var remaining = buf.length - offset;
              if (!length) {
                length = remaining;
              } else {
                length = Number(length);
                if (length > remaining) {
                  length = remaining;
                }
              }

              // must be an even number of digits
              var strLen = string.length;
              if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

              if (length > strLen / 2) {
                length = strLen / 2;
              }
              for (var i = 0; i < length; ++i) {
                var parsed = parseInt(string.substr(i * 2, 2), 16);
                if (isNaN(parsed)) return i
                buf[offset + i] = parsed;
              }
              return i
            }

            function utf8Write (buf, string, offset, length) {
              return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
            }

            function asciiWrite (buf, string, offset, length) {
              return blitBuffer(asciiToBytes(string), buf, offset, length)
            }

            function latin1Write (buf, string, offset, length) {
              return asciiWrite(buf, string, offset, length)
            }

            function base64Write (buf, string, offset, length) {
              return blitBuffer(base64ToBytes(string), buf, offset, length)
            }

            function ucs2Write (buf, string, offset, length) {
              return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
            }

            Buffer.prototype.write = function write$$1 (string, offset, length, encoding) {
              // Buffer#write(string)
              if (offset === undefined) {
                encoding = 'utf8';
                length = this.length;
                offset = 0;
              // Buffer#write(string, encoding)
              } else if (length === undefined && typeof offset === 'string') {
                encoding = offset;
                length = this.length;
                offset = 0;
              // Buffer#write(string, offset[, length][, encoding])
              } else if (isFinite(offset)) {
                offset = offset | 0;
                if (isFinite(length)) {
                  length = length | 0;
                  if (encoding === undefined) encoding = 'utf8';
                } else {
                  encoding = length;
                  length = undefined;
                }
              // legacy write(string, encoding, offset, length) - remove in v0.13
              } else {
                throw new Error(
                  'Buffer.write(string, encoding, offset[, length]) is no longer supported'
                )
              }

              var remaining = this.length - offset;
              if (length === undefined || length > remaining) length = remaining;

              if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
                throw new RangeError('Attempt to write outside buffer bounds')
              }

              if (!encoding) encoding = 'utf8';

              var loweredCase = false;
              for (;;) {
                switch (encoding) {
                  case 'hex':
                    return hexWrite(this, string, offset, length)

                  case 'utf8':
                  case 'utf-8':
                    return utf8Write(this, string, offset, length)

                  case 'ascii':
                    return asciiWrite(this, string, offset, length)

                  case 'latin1':
                  case 'binary':
                    return latin1Write(this, string, offset, length)

                  case 'base64':
                    // Warning: maxLength not taken into account in base64Write
                    return base64Write(this, string, offset, length)

                  case 'ucs2':
                  case 'ucs-2':
                  case 'utf16le':
                  case 'utf-16le':
                    return ucs2Write(this, string, offset, length)

                  default:
                    if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                    encoding = ('' + encoding).toLowerCase();
                    loweredCase = true;
                }
              }
            };

            Buffer.prototype.toJSON = function toJSON () {
              return {
                type: 'Buffer',
                data: Array.prototype.slice.call(this._arr || this, 0)
              }
            };

            function base64Slice (buf, start, end) {
              if (start === 0 && end === buf.length) {
                return fromByteArray(buf)
              } else {
                return fromByteArray(buf.slice(start, end))
              }
            }

            function utf8Slice (buf, start, end) {
              end = Math.min(buf.length, end);
              var res = [];

              var i = start;
              while (i < end) {
                var firstByte = buf[i];
                var codePoint = null;
                var bytesPerSequence = (firstByte > 0xEF) ? 4
                  : (firstByte > 0xDF) ? 3
                  : (firstByte > 0xBF) ? 2
                  : 1;

                if (i + bytesPerSequence <= end) {
                  var secondByte, thirdByte, fourthByte, tempCodePoint;

                  switch (bytesPerSequence) {
                    case 1:
                      if (firstByte < 0x80) {
                        codePoint = firstByte;
                      }
                      break
                    case 2:
                      secondByte = buf[i + 1];
                      if ((secondByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                        if (tempCodePoint > 0x7F) {
                          codePoint = tempCodePoint;
                        }
                      }
                      break
                    case 3:
                      secondByte = buf[i + 1];
                      thirdByte = buf[i + 2];
                      if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                        if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                          codePoint = tempCodePoint;
                        }
                      }
                      break
                    case 4:
                      secondByte = buf[i + 1];
                      thirdByte = buf[i + 2];
                      fourthByte = buf[i + 3];
                      if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                        if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                          codePoint = tempCodePoint;
                        }
                      }
                  }
                }

                if (codePoint === null) {
                  // we did not generate a valid codePoint so insert a
                  // replacement char (U+FFFD) and advance only 1 byte
                  codePoint = 0xFFFD;
                  bytesPerSequence = 1;
                } else if (codePoint > 0xFFFF) {
                  // encode to utf16 (surrogate pair dance)
                  codePoint -= 0x10000;
                  res.push(codePoint >>> 10 & 0x3FF | 0xD800);
                  codePoint = 0xDC00 | codePoint & 0x3FF;
                }

                res.push(codePoint);
                i += bytesPerSequence;
              }

              return decodeCodePointsArray(res)
            }

            // Based on http://stackoverflow.com/a/22747272/680742, the browser with
            // the lowest limit is Chrome, with 0x10000 args.
            // We go 1 magnitude less, for safety
            var MAX_ARGUMENTS_LENGTH = 0x1000;

            function decodeCodePointsArray (codePoints) {
              var len = codePoints.length;
              if (len <= MAX_ARGUMENTS_LENGTH) {
                return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
              }

              // Decode in chunks to avoid "call stack size exceeded".
              var res = '';
              var i = 0;
              while (i < len) {
                res += String.fromCharCode.apply(
                  String,
                  codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
                );
              }
              return res
            }

            function asciiSlice (buf, start, end) {
              var ret = '';
              end = Math.min(buf.length, end);

              for (var i = start; i < end; ++i) {
                ret += String.fromCharCode(buf[i] & 0x7F);
              }
              return ret
            }

            function latin1Slice (buf, start, end) {
              var ret = '';
              end = Math.min(buf.length, end);

              for (var i = start; i < end; ++i) {
                ret += String.fromCharCode(buf[i]);
              }
              return ret
            }

            function hexSlice (buf, start, end) {
              var len = buf.length;

              if (!start || start < 0) start = 0;
              if (!end || end < 0 || end > len) end = len;

              var out = '';
              for (var i = start; i < end; ++i) {
                out += toHex(buf[i]);
              }
              return out
            }

            function utf16leSlice (buf, start, end) {
              var bytes = buf.slice(start, end);
              var res = '';
              for (var i = 0; i < bytes.length; i += 2) {
                res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
              }
              return res
            }

            Buffer.prototype.slice = function slice (start, end) {
              var len = this.length;
              start = ~~start;
              end = end === undefined ? len : ~~end;

              if (start < 0) {
                start += len;
                if (start < 0) start = 0;
              } else if (start > len) {
                start = len;
              }

              if (end < 0) {
                end += len;
                if (end < 0) end = 0;
              } else if (end > len) {
                end = len;
              }

              if (end < start) end = start;

              var newBuf;
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                newBuf = this.subarray(start, end);
                newBuf.__proto__ = Buffer.prototype;
              } else {
                var sliceLen = end - start;
                newBuf = new Buffer(sliceLen, undefined);
                for (var i = 0; i < sliceLen; ++i) {
                  newBuf[i] = this[i + start];
                }
              }

              return newBuf
            };

            /*
             * Need to make sure that buffer isn't trying to write out of bounds.
             */
            function checkOffset (offset, ext, length) {
              if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
              if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
            }

            Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) checkOffset(offset, byteLength, this.length);

              var val = this[offset];
              var mul = 1;
              var i = 0;
              while (++i < byteLength && (mul *= 0x100)) {
                val += this[offset + i] * mul;
              }

              return val
            };

            Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) {
                checkOffset(offset, byteLength, this.length);
              }

              var val = this[offset + --byteLength];
              var mul = 1;
              while (byteLength > 0 && (mul *= 0x100)) {
                val += this[offset + --byteLength] * mul;
              }

              return val
            };

            Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 1, this.length);
              return this[offset]
            };

            Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              return this[offset] | (this[offset + 1] << 8)
            };

            Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              return (this[offset] << 8) | this[offset + 1]
            };

            Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);

              return ((this[offset]) |
                  (this[offset + 1] << 8) |
                  (this[offset + 2] << 16)) +
                  (this[offset + 3] * 0x1000000)
            };

            Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);

              return (this[offset] * 0x1000000) +
                ((this[offset + 1] << 16) |
                (this[offset + 2] << 8) |
                this[offset + 3])
            };

            Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) checkOffset(offset, byteLength, this.length);

              var val = this[offset];
              var mul = 1;
              var i = 0;
              while (++i < byteLength && (mul *= 0x100)) {
                val += this[offset + i] * mul;
              }
              mul *= 0x80;

              if (val >= mul) val -= Math.pow(2, 8 * byteLength);

              return val
            };

            Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) checkOffset(offset, byteLength, this.length);

              var i = byteLength;
              var mul = 1;
              var val = this[offset + --i];
              while (i > 0 && (mul *= 0x100)) {
                val += this[offset + --i] * mul;
              }
              mul *= 0x80;

              if (val >= mul) val -= Math.pow(2, 8 * byteLength);

              return val
            };

            Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 1, this.length);
              if (!(this[offset] & 0x80)) return (this[offset])
              return ((0xff - this[offset] + 1) * -1)
            };

            Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              var val = this[offset] | (this[offset + 1] << 8);
              return (val & 0x8000) ? val | 0xFFFF0000 : val
            };

            Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              var val = this[offset + 1] | (this[offset] << 8);
              return (val & 0x8000) ? val | 0xFFFF0000 : val
            };

            Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);

              return (this[offset]) |
                (this[offset + 1] << 8) |
                (this[offset + 2] << 16) |
                (this[offset + 3] << 24)
            };

            Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);

              return (this[offset] << 24) |
                (this[offset + 1] << 16) |
                (this[offset + 2] << 8) |
                (this[offset + 3])
            };

            Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);
              return read(this, offset, true, 23, 4)
            };

            Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);
              return read(this, offset, false, 23, 4)
            };

            Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 8, this.length);
              return read(this, offset, true, 52, 8)
            };

            Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 8, this.length);
              return read(this, offset, false, 52, 8)
            };

            function checkInt (buf, value, offset, ext, max, min) {
              if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
              if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
              if (offset + ext > buf.length) throw new RangeError('Index out of range')
            }

            Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) {
                var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                checkInt(this, value, offset, byteLength, maxBytes, 0);
              }

              var mul = 1;
              var i = 0;
              this[offset] = value & 0xFF;
              while (++i < byteLength && (mul *= 0x100)) {
                this[offset + i] = (value / mul) & 0xFF;
              }

              return offset + byteLength
            };

            Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) {
                var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                checkInt(this, value, offset, byteLength, maxBytes, 0);
              }

              var i = byteLength - 1;
              var mul = 1;
              this[offset + i] = value & 0xFF;
              while (--i >= 0 && (mul *= 0x100)) {
                this[offset + i] = (value / mul) & 0xFF;
              }

              return offset + byteLength
            };

            Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
              if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
              this[offset] = (value & 0xff);
              return offset + 1
            };

            function objectWriteUInt16 (buf, value, offset, littleEndian) {
              if (value < 0) value = 0xffff + value + 1;
              for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
                buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
                  (littleEndian ? i : 1 - i) * 8;
              }
            }

            Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value & 0xff);
                this[offset + 1] = (value >>> 8);
              } else {
                objectWriteUInt16(this, value, offset, true);
              }
              return offset + 2
            };

            Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value >>> 8);
                this[offset + 1] = (value & 0xff);
              } else {
                objectWriteUInt16(this, value, offset, false);
              }
              return offset + 2
            };

            function objectWriteUInt32 (buf, value, offset, littleEndian) {
              if (value < 0) value = 0xffffffff + value + 1;
              for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
                buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
              }
            }

            Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset + 3] = (value >>> 24);
                this[offset + 2] = (value >>> 16);
                this[offset + 1] = (value >>> 8);
                this[offset] = (value & 0xff);
              } else {
                objectWriteUInt32(this, value, offset, true);
              }
              return offset + 4
            };

            Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value >>> 24);
                this[offset + 1] = (value >>> 16);
                this[offset + 2] = (value >>> 8);
                this[offset + 3] = (value & 0xff);
              } else {
                objectWriteUInt32(this, value, offset, false);
              }
              return offset + 4
            };

            Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) {
                var limit = Math.pow(2, 8 * byteLength - 1);

                checkInt(this, value, offset, byteLength, limit - 1, -limit);
              }

              var i = 0;
              var mul = 1;
              var sub = 0;
              this[offset] = value & 0xFF;
              while (++i < byteLength && (mul *= 0x100)) {
                if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
                  sub = 1;
                }
                this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
              }

              return offset + byteLength
            };

            Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) {
                var limit = Math.pow(2, 8 * byteLength - 1);

                checkInt(this, value, offset, byteLength, limit - 1, -limit);
              }

              var i = byteLength - 1;
              var mul = 1;
              var sub = 0;
              this[offset + i] = value & 0xFF;
              while (--i >= 0 && (mul *= 0x100)) {
                if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
                  sub = 1;
                }
                this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
              }

              return offset + byteLength
            };

            Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
              if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
              if (value < 0) value = 0xff + value + 1;
              this[offset] = (value & 0xff);
              return offset + 1
            };

            Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value & 0xff);
                this[offset + 1] = (value >>> 8);
              } else {
                objectWriteUInt16(this, value, offset, true);
              }
              return offset + 2
            };

            Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value >>> 8);
                this[offset + 1] = (value & 0xff);
              } else {
                objectWriteUInt16(this, value, offset, false);
              }
              return offset + 2
            };

            Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value & 0xff);
                this[offset + 1] = (value >>> 8);
                this[offset + 2] = (value >>> 16);
                this[offset + 3] = (value >>> 24);
              } else {
                objectWriteUInt32(this, value, offset, true);
              }
              return offset + 4
            };

            Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
              if (value < 0) value = 0xffffffff + value + 1;
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value >>> 24);
                this[offset + 1] = (value >>> 16);
                this[offset + 2] = (value >>> 8);
                this[offset + 3] = (value & 0xff);
              } else {
                objectWriteUInt32(this, value, offset, false);
              }
              return offset + 4
            };

            function checkIEEE754 (buf, value, offset, ext, max, min) {
              if (offset + ext > buf.length) throw new RangeError('Index out of range')
              if (offset < 0) throw new RangeError('Index out of range')
            }

            function writeFloat (buf, value, offset, littleEndian, noAssert) {
              if (!noAssert) {
                checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
              }
              write(buf, value, offset, littleEndian, 23, 4);
              return offset + 4
            }

            Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
              return writeFloat(this, value, offset, true, noAssert)
            };

            Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
              return writeFloat(this, value, offset, false, noAssert)
            };

            function writeDouble (buf, value, offset, littleEndian, noAssert) {
              if (!noAssert) {
                checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
              }
              write(buf, value, offset, littleEndian, 52, 8);
              return offset + 8
            }

            Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
              return writeDouble(this, value, offset, true, noAssert)
            };

            Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
              return writeDouble(this, value, offset, false, noAssert)
            };

            // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
            Buffer.prototype.copy = function copy (target, targetStart, start, end) {
              if (!start) start = 0;
              if (!end && end !== 0) end = this.length;
              if (targetStart >= target.length) targetStart = target.length;
              if (!targetStart) targetStart = 0;
              if (end > 0 && end < start) end = start;

              // Copy 0 bytes; we're done
              if (end === start) return 0
              if (target.length === 0 || this.length === 0) return 0

              // Fatal error conditions
              if (targetStart < 0) {
                throw new RangeError('targetStart out of bounds')
              }
              if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
              if (end < 0) throw new RangeError('sourceEnd out of bounds')

              // Are we oob?
              if (end > this.length) end = this.length;
              if (target.length - targetStart < end - start) {
                end = target.length - targetStart + start;
              }

              var len = end - start;
              var i;

              if (this === target && start < targetStart && targetStart < end) {
                // descending copy from end
                for (i = len - 1; i >= 0; --i) {
                  target[i + targetStart] = this[i + start];
                }
              } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
                // ascending copy from start
                for (i = 0; i < len; ++i) {
                  target[i + targetStart] = this[i + start];
                }
              } else {
                Uint8Array.prototype.set.call(
                  target,
                  this.subarray(start, start + len),
                  targetStart
                );
              }

              return len
            };

            // Usage:
            //    buffer.fill(number[, offset[, end]])
            //    buffer.fill(buffer[, offset[, end]])
            //    buffer.fill(string[, offset[, end]][, encoding])
            Buffer.prototype.fill = function fill (val, start, end, encoding) {
              // Handle string cases:
              if (typeof val === 'string') {
                if (typeof start === 'string') {
                  encoding = start;
                  start = 0;
                  end = this.length;
                } else if (typeof end === 'string') {
                  encoding = end;
                  end = this.length;
                }
                if (val.length === 1) {
                  var code = val.charCodeAt(0);
                  if (code < 256) {
                    val = code;
                  }
                }
                if (encoding !== undefined && typeof encoding !== 'string') {
                  throw new TypeError('encoding must be a string')
                }
                if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
                  throw new TypeError('Unknown encoding: ' + encoding)
                }
              } else if (typeof val === 'number') {
                val = val & 255;
              }

              // Invalid ranges are not set to a default, so can range check early.
              if (start < 0 || this.length < start || this.length < end) {
                throw new RangeError('Out of range index')
              }

              if (end <= start) {
                return this
              }

              start = start >>> 0;
              end = end === undefined ? this.length : end >>> 0;

              if (!val) val = 0;

              var i;
              if (typeof val === 'number') {
                for (i = start; i < end; ++i) {
                  this[i] = val;
                }
              } else {
                var bytes = internalIsBuffer(val)
                  ? val
                  : utf8ToBytes(new Buffer(val, encoding).toString());
                var len = bytes.length;
                for (i = 0; i < end - start; ++i) {
                  this[i + start] = bytes[i % len];
                }
              }

              return this
            };

            // HELPER FUNCTIONS
            // ================

            var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

            function base64clean (str) {
              // Node strips out invalid characters like \n and \t from the string, base64-js does not
              str = stringtrim(str).replace(INVALID_BASE64_RE, '');
              // Node converts strings with length < 2 to ''
              if (str.length < 2) return ''
              // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
              while (str.length % 4 !== 0) {
                str = str + '=';
              }
              return str
            }

            function stringtrim (str) {
              if (str.trim) return str.trim()
              return str.replace(/^\s+|\s+$/g, '')
            }

            function toHex (n) {
              if (n < 16) return '0' + n.toString(16)
              return n.toString(16)
            }

            function utf8ToBytes (string, units) {
              units = units || Infinity;
              var codePoint;
              var length = string.length;
              var leadSurrogate = null;
              var bytes = [];

              for (var i = 0; i < length; ++i) {
                codePoint = string.charCodeAt(i);

                // is surrogate component
                if (codePoint > 0xD7FF && codePoint < 0xE000) {
                  // last char was a lead
                  if (!leadSurrogate) {
                    // no lead yet
                    if (codePoint > 0xDBFF) {
                      // unexpected trail
                      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                      continue
                    } else if (i + 1 === length) {
                      // unpaired lead
                      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                      continue
                    }

                    // valid lead
                    leadSurrogate = codePoint;

                    continue
                  }

                  // 2 leads in a row
                  if (codePoint < 0xDC00) {
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    leadSurrogate = codePoint;
                    continue
                  }

                  // valid surrogate pair
                  codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
                } else if (leadSurrogate) {
                  // valid bmp char, but last char was a lead
                  if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                }

                leadSurrogate = null;

                // encode utf8
                if (codePoint < 0x80) {
                  if ((units -= 1) < 0) break
                  bytes.push(codePoint);
                } else if (codePoint < 0x800) {
                  if ((units -= 2) < 0) break
                  bytes.push(
                    codePoint >> 0x6 | 0xC0,
                    codePoint & 0x3F | 0x80
                  );
                } else if (codePoint < 0x10000) {
                  if ((units -= 3) < 0) break
                  bytes.push(
                    codePoint >> 0xC | 0xE0,
                    codePoint >> 0x6 & 0x3F | 0x80,
                    codePoint & 0x3F | 0x80
                  );
                } else if (codePoint < 0x110000) {
                  if ((units -= 4) < 0) break
                  bytes.push(
                    codePoint >> 0x12 | 0xF0,
                    codePoint >> 0xC & 0x3F | 0x80,
                    codePoint >> 0x6 & 0x3F | 0x80,
                    codePoint & 0x3F | 0x80
                  );
                } else {
                  throw new Error('Invalid code point')
                }
              }

              return bytes
            }

            function asciiToBytes (str) {
              var byteArray = [];
              for (var i = 0; i < str.length; ++i) {
                // Node's code seems to be doing this and not & 0x7F..
                byteArray.push(str.charCodeAt(i) & 0xFF);
              }
              return byteArray
            }

            function utf16leToBytes (str, units) {
              var c, hi, lo;
              var byteArray = [];
              for (var i = 0; i < str.length; ++i) {
                if ((units -= 2) < 0) break

                c = str.charCodeAt(i);
                hi = c >> 8;
                lo = c % 256;
                byteArray.push(lo);
                byteArray.push(hi);
              }

              return byteArray
            }


            function base64ToBytes (str) {
              return toByteArray(base64clean(str))
            }

            function blitBuffer (src, dst, offset, length) {
              for (var i = 0; i < length; ++i) {
                if ((i + offset >= dst.length) || (i >= src.length)) break
                dst[i + offset] = src[i];
              }
              return i
            }

            function isnan (val) {
              return val !== val // eslint-disable-line no-self-compare
            }


            // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
            // The _isBuffer check is for Safari 5-7 support, because it's missing
            // Object.prototype.constructor. Remove this eventually
            function isBuffer(obj) {
              return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
            }

            function isFastBuffer (obj) {
              return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
            }

            // For Node v0.10 support. Remove this eventually.
            function isSlowBuffer (obj) {
              return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
            }

            //[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
            //[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
            //[5]   	Name	   ::=   	NameStartChar (NameChar)*
            var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;//\u10000-\uEFFFF
            var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
            var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
            //var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
            //var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

            //S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
            //S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
            var S_TAG = 0;//tag name offerring
            var S_ATTR = 1;//attr name offerring 
            var S_ATTR_SPACE=2;//attr name end and space offer
            var S_EQ = 3;//=space?
            var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
            var S_ATTR_END = 5;//attr value end and no space(quot end)
            var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
            var S_TAG_CLOSE = 7;//closed el<el />

            function XMLReader(){
            	
            }

            XMLReader.prototype = {
            	parse:function(source,defaultNSMap,entityMap){
            		var domBuilder = this.domBuilder;
            		domBuilder.startDocument();
            		_copy(defaultNSMap ,defaultNSMap = {});
            		parse(source,defaultNSMap,entityMap,
            				domBuilder,this.errorHandler);
            		domBuilder.endDocument();
            	}
            };
            function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
            	function fixedFromCharCode(code) {
            		// String.prototype.fromCharCode does not supports
            		// > 2 bytes unicode chars directly
            		if (code > 0xffff) {
            			code -= 0x10000;
            			var surrogate1 = 0xd800 + (code >> 10)
            				, surrogate2 = 0xdc00 + (code & 0x3ff);

            			return String.fromCharCode(surrogate1, surrogate2);
            		} else {
            			return String.fromCharCode(code);
            		}
            	}
            	function entityReplacer(a){
            		var k = a.slice(1,-1);
            		if(k in entityMap){
            			return entityMap[k]; 
            		}else if(k.charAt(0) === '#'){
            			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
            		}else{
            			errorHandler.error('entity not found:'+a);
            			return a;
            		}
            	}
            	function appendText(end){//has some bugs
            		if(end>start){
            			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
            			locator&&position(start);
            			domBuilder.characters(xt,0,end-start);
            			start = end;
            		}
            	}
            	function position(p,m){
            		while(p>=lineEnd && (m = linePattern.exec(source))){
            			lineStart = m.index;
            			lineEnd = lineStart + m[0].length;
            			locator.lineNumber++;
            			//console.log('line++:',locator,startPos,endPos)
            		}
            		locator.columnNumber = p-lineStart+1;
            	}
            	var lineStart = 0;
            	var lineEnd = 0;
            	var linePattern = /.*(?:\r\n?|\n)|.*$/g;
            	var locator = domBuilder.locator;
            	
            	var parseStack = [{currentNSMap:defaultNSMapCopy}];
            	var closeMap = {};
            	var start = 0;
            	while(true){
            		try{
            			var tagStart = source.indexOf('<',start);
            			if(tagStart<0){
            				if(!source.substr(start).match(/^\s*$/)){
            					var doc = domBuilder.doc;
            	    			var text = doc.createTextNode(source.substr(start));
            	    			doc.appendChild(text);
            	    			domBuilder.currentElement = text;
            				}
            				return;
            			}
            			if(tagStart>start){
            				appendText(tagStart);
            			}
            			switch(source.charAt(tagStart+1)){
            			case '/':
            				var end = source.indexOf('>',tagStart+3);
            				var tagName = source.substring(tagStart+2,end);
            				var config = parseStack.pop();
            				if(end<0){
            					
            	        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
            	        		//console.error('#@@@@@@'+tagName)
            	        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
            	        		end = tagStart+1+tagName.length;
            	        	}else if(tagName.match(/\s</)){
            	        		tagName = tagName.replace(/[\s<].*/,'');
            	        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
            	        		end = tagStart+1+tagName.length;
            				}
            				//console.error(parseStack.length,parseStack)
            				//console.error(config);
            				var localNSMap = config.localNSMap;
            				var endMatch = config.tagName == tagName;
            				var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase();
            		        if(endIgnoreCaseMach){
            		        	domBuilder.endElement(config.uri,config.localName,tagName);
            					if(localNSMap){
            						for(var prefix in localNSMap){
            							domBuilder.endPrefixMapping(prefix) ;
            						}
            					}
            					if(!endMatch){
            		            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName );
            					}
            		        }else{
            		        	parseStack.push(config);
            		        }
            				
            				end++;
            				break;
            				// end elment
            			case '?':// <?...?>
            				locator&&position(tagStart);
            				end = parseInstruction(source,tagStart,domBuilder);
            				break;
            			case '!':// <!doctype,<![CDATA,<!--
            				locator&&position(tagStart);
            				end = parseDCC(source,tagStart,domBuilder,errorHandler);
            				break;
            			default:
            				locator&&position(tagStart);
            				var el = new ElementAttributes();
            				var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
            				//elStartEnd
            				var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
            				var len = el.length;
            				
            				
            				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
            					el.closed = true;
            					if(!entityMap.nbsp){
            						errorHandler.warning('unclosed xml attribute');
            					}
            				}
            				if(locator && len){
            					var locator2 = copyLocator(locator,{});
            					//try{//attribute position fixed
            					for(var i = 0;i<len;i++){
            						var a = el[i];
            						position(a.offset);
            						a.locator = copyLocator(locator,{});
            					}
            					//}catch(e){console.error('@@@@@'+e)}
            					domBuilder.locator = locator2;
            					if(appendElement(el,domBuilder,currentNSMap)){
            						parseStack.push(el);
            					}
            					domBuilder.locator = locator;
            				}else{
            					if(appendElement(el,domBuilder,currentNSMap)){
            						parseStack.push(el);
            					}
            				}
            				
            				
            				
            				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
            					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder);
            				}else{
            					end++;
            				}
            			}
            		}catch(e){
            			errorHandler.error('element parse error: '+e);
            			//errorHandler.error('element parse error: '+e);
            			end = -1;
            			//throw e;
            		}
            		if(end>start){
            			start = end;
            		}else{
            			//TODO: 这里有可能sax回退，有位置错误风险
            			appendText(Math.max(tagStart,start)+1);
            		}
            	}
            }
            function copyLocator(f,t){
            	t.lineNumber = f.lineNumber;
            	t.columnNumber = f.columnNumber;
            	return t;
            }

            /**
             * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
             * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
             */
            function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){
            	var attrName;
            	var value;
            	var p = ++start;
            	var s = S_TAG;//status
            	while(true){
            		var c = source.charAt(p);
            		switch(c){
            		case '=':
            			if(s === S_ATTR){//attrName
            				attrName = source.slice(start,p);
            				s = S_EQ;
            			}else if(s === S_ATTR_SPACE){
            				s = S_EQ;
            			}else{
            				//fatalError: equal must after attrName or space after attrName
            				throw new Error('attribute equal must after attrName');
            			}
            			break;
            		case '\'':
            		case '"':
            			if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
            				){//equal
            				if(s === S_ATTR){
            					errorHandler.warning('attribute value must after "="');
            					attrName = source.slice(start,p);
            				}
            				start = p+1;
            				p = source.indexOf(c,start);
            				if(p>0){
            					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
            					el.add(attrName,value,start-1);
            					s = S_ATTR_END;
            				}else{
            					//fatalError: no end quot match
            					throw new Error('attribute value no end \''+c+'\' match');
            				}
            			}else if(s == S_ATTR_NOQUOT_VALUE){
            				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
            				//console.log(attrName,value,start,p)
            				el.add(attrName,value,start);
            				//console.dir(el)
            				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
            				start = p+1;
            				s = S_ATTR_END;
            			}else{
            				//fatalError: no equal before
            				throw new Error('attribute value must after "="');
            			}
            			break;
            		case '/':
            			switch(s){
            			case S_TAG:
            				el.setTagName(source.slice(start,p));
            			case S_ATTR_END:
            			case S_TAG_SPACE:
            			case S_TAG_CLOSE:
            				s =S_TAG_CLOSE;
            				el.closed = true;
            			case S_ATTR_NOQUOT_VALUE:
            			case S_ATTR:
            			case S_ATTR_SPACE:
            				break;
            			//case S_EQ:
            			default:
            				throw new Error("attribute invalid close char('/')")
            			}
            			break;
            		case ''://end document
            			//throw new Error('unexpected end of input')
            			errorHandler.error('unexpected end of input');
            			if(s == S_TAG){
            				el.setTagName(source.slice(start,p));
            			}
            			return p;
            		case '>':
            			switch(s){
            			case S_TAG:
            				el.setTagName(source.slice(start,p));
            			case S_ATTR_END:
            			case S_TAG_SPACE:
            			case S_TAG_CLOSE:
            				break;//normal
            			case S_ATTR_NOQUOT_VALUE://Compatible state
            			case S_ATTR:
            				value = source.slice(start,p);
            				if(value.slice(-1) === '/'){
            					el.closed  = true;
            					value = value.slice(0,-1);
            				}
            			case S_ATTR_SPACE:
            				if(s === S_ATTR_SPACE){
            					value = attrName;
            				}
            				if(s == S_ATTR_NOQUOT_VALUE){
            					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
            					el.add(attrName,value.replace(/&#?\w+;/g,entityReplacer),start);
            				}else{
            					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
            						errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!');
            					}
            					el.add(value,value,start);
            				}
            				break;
            			case S_EQ:
            				throw new Error('attribute value missed!!');
            			}
            //			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
            			return p;
            		/*xml space '\x20' | #x9 | #xD | #xA; */
            		case '\u0080':
            			c = ' ';
            		default:
            			if(c<= ' '){//space
            				switch(s){
            				case S_TAG:
            					el.setTagName(source.slice(start,p));//tagName
            					s = S_TAG_SPACE;
            					break;
            				case S_ATTR:
            					attrName = source.slice(start,p);
            					s = S_ATTR_SPACE;
            					break;
            				case S_ATTR_NOQUOT_VALUE:
            					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
            					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
            					el.add(attrName,value,start);
            				case S_ATTR_END:
            					s = S_TAG_SPACE;
            					break;
            				//case S_TAG_SPACE:
            				//case S_EQ:
            				//case S_ATTR_SPACE:
            				//	void();break;
            				//case S_TAG_CLOSE:
            					//ignore warning
            				}
            			}else{//not space
            //S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
            //S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
            				switch(s){
            				//case S_TAG:void();break;
            				//case S_ATTR:void();break;
            				//case S_ATTR_NOQUOT_VALUE:void();break;
            				case S_ATTR_SPACE:
            					var tagName =  el.tagName;
            					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
            						errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!');
            					}
            					el.add(attrName,attrName,start);
            					start = p;
            					s = S_ATTR;
            					break;
            				case S_ATTR_END:
            					errorHandler.warning('attribute space is required"'+attrName+'"!!');
            				case S_TAG_SPACE:
            					s = S_ATTR;
            					start = p;
            					break;
            				case S_EQ:
            					s = S_ATTR_NOQUOT_VALUE;
            					start = p;
            					break;
            				case S_TAG_CLOSE:
            					throw new Error("elements closed character '/' and '>' must be connected to");
            				}
            			}
            		}//end outer switch
            		//console.log('p++',p)
            		p++;
            	}
            }
            /**
             * @return true if has new namespace define
             */
            function appendElement(el,domBuilder,currentNSMap){
            	var tagName = el.tagName;
            	var localNSMap = null;
            	//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
            	var i = el.length;
            	while(i--){
            		var a = el[i];
            		var qName = a.qName;
            		var value = a.value;
            		var nsp = qName.indexOf(':');
            		if(nsp>0){
            			var prefix = a.prefix = qName.slice(0,nsp);
            			var localName = qName.slice(nsp+1);
            			var nsPrefix = prefix === 'xmlns' && localName;
            		}else{
            			localName = qName;
            			prefix = null;
            			nsPrefix = qName === 'xmlns' && '';
            		}
            		//can not set prefix,because prefix !== ''
            		a.localName = localName ;
            		//prefix == null for no ns prefix attribute 
            		if(nsPrefix !== false){//hack!!
            			if(localNSMap == null){
            				localNSMap = {};
            				//console.log(currentNSMap,0)
            				_copy(currentNSMap,currentNSMap={});
            				//console.log(currentNSMap,1)
            			}
            			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
            			a.uri = 'http://www.w3.org/2000/xmlns/';
            			domBuilder.startPrefixMapping(nsPrefix, value); 
            		}
            	}
            	var i = el.length;
            	while(i--){
            		a = el[i];
            		var prefix = a.prefix;
            		if(prefix){//no prefix attribute has no namespace
            			if(prefix === 'xml'){
            				a.uri = 'http://www.w3.org/XML/1998/namespace';
            			}if(prefix !== 'xmlns'){
            				a.uri = currentNSMap[prefix || ''];
            				
            				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
            			}
            		}
            	}
            	var nsp = tagName.indexOf(':');
            	if(nsp>0){
            		prefix = el.prefix = tagName.slice(0,nsp);
            		localName = el.localName = tagName.slice(nsp+1);
            	}else{
            		prefix = null;//important!!
            		localName = el.localName = tagName;
            	}
            	//no prefix element has default namespace
            	var ns = el.uri = currentNSMap[prefix || ''];
            	domBuilder.startElement(ns,localName,tagName,el);
            	//endPrefixMapping and startPrefixMapping have not any help for dom builder
            	//localNSMap = null
            	if(el.closed){
            		domBuilder.endElement(ns,localName,tagName);
            		if(localNSMap){
            			for(prefix in localNSMap){
            				domBuilder.endPrefixMapping(prefix); 
            			}
            		}
            	}else{
            		el.currentNSMap = currentNSMap;
            		el.localNSMap = localNSMap;
            		//parseStack.push(el);
            		return true;
            	}
            }
            function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
            	if(/^(?:script|textarea)$/i.test(tagName)){
            		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
            		var text = source.substring(elStartEnd+1,elEndStart);
            		if(/[&<]/.test(text)){
            			if(/^script$/i.test(tagName)){
            				//if(!/\]\]>/.test(text)){
            					//lexHandler.startCDATA();
            					domBuilder.characters(text,0,text.length);
            					//lexHandler.endCDATA();
            					return elEndStart;
            				//}
            			}//}else{//text area
            				text = text.replace(/&#?\w+;/g,entityReplacer);
            				domBuilder.characters(text,0,text.length);
            				return elEndStart;
            			//}
            			
            		}
            	}
            	return elStartEnd+1;
            }
            function fixSelfClosed(source,elStartEnd,tagName,closeMap){
            	//if(tagName in closeMap){
            	var pos = closeMap[tagName];
            	if(pos == null){
            		//console.log(tagName)
            		pos =  source.lastIndexOf('</'+tagName+'>');
            		if(pos<elStartEnd){//忘记闭合
            			pos = source.lastIndexOf('</'+tagName);
            		}
            		closeMap[tagName] =pos;
            	}
            	return pos<elStartEnd;
            	//} 
            }
            function _copy(source,target){
            	for(var n in source){target[n] = source[n];}
            }
            function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
            	var next= source.charAt(start+2);
            	switch(next){
            	case '-':
            		if(source.charAt(start + 3) === '-'){
            			var end = source.indexOf('-->',start+4);
            			//append comment source.substring(4,end)//<!--
            			if(end>start){
            				domBuilder.comment(source,start+4,end-start-4);
            				return end+3;
            			}else{
            				errorHandler.error("Unclosed comment");
            				return -1;
            			}
            		}else{
            			//error
            			return -1;
            		}
            	default:
            		if(source.substr(start+3,6) == 'CDATA['){
            			var end = source.indexOf(']]>',start+9);
            			domBuilder.startCDATA();
            			domBuilder.characters(source,start+9,end-start-9);
            			domBuilder.endCDATA(); 
            			return end+3;
            		}
            		//<!DOCTYPE
            		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
            		var matchs = split(source,start);
            		var len = matchs.length;
            		if(len>1 && /!doctype/i.test(matchs[0][0])){
            			var name = matchs[1][0];
            			var pubid = len>3 && /^public$/i.test(matchs[2][0]) && matchs[3][0];
            			var sysid = len>4 && matchs[4][0];
            			var lastMatch = matchs[len-1];
            			domBuilder.startDTD(name,pubid && pubid.replace(/^(['"])(.*?)\1$/,'$2'),
            					sysid && sysid.replace(/^(['"])(.*?)\1$/,'$2'));
            			domBuilder.endDTD();
            			
            			return lastMatch.index+lastMatch[0].length
            		}
            	}
            	return -1;
            }



            function parseInstruction(source,start,domBuilder){
            	var end = source.indexOf('?>',start);
            	if(end){
            		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
            		if(match){
            			var len = match[0].length;
            			domBuilder.processingInstruction(match[1], match[2]) ;
            			return end+2;
            		}else{//error
            			return -1;
            		}
            	}
            	return -1;
            }

            /**
             * @param source
             */
            function ElementAttributes(source){
            	
            }
            ElementAttributes.prototype = {
            	setTagName:function(tagName){
            		if(!tagNamePattern.test(tagName)){
            			throw new Error('invalid tagName:'+tagName)
            		}
            		this.tagName = tagName;
            	},
            	add:function(qName,value,offset){
            		if(!tagNamePattern.test(qName)){
            			throw new Error('invalid attribute:'+qName)
            		}
            		this[this.length++] = {qName:qName,value:value,offset:offset};
            	},
            	length:0,
            	getLocalName:function(i){return this[i].localName},
            	getLocator:function(i){return this[i].locator},
            	getQName:function(i){return this[i].qName},
            	getURI:function(i){return this[i].uri},
            	getValue:function(i){return this[i].value}
            //	,getIndex:function(uri, localName)){
            //		if(localName){
            //			
            //		}else{
            //			var qName = uri
            //		}
            //	},
            //	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
            //	getType:function(uri,localName){}
            //	getType:function(i){},
            };




            function _set_proto_(thiz,parent){
            	thiz.__proto__ = parent;
            	return thiz;
            }
            if(!(_set_proto_({},_set_proto_.prototype) instanceof _set_proto_)){
            	_set_proto_ = function(thiz,parent){
            		function p(){}		p.prototype = parent;
            		p = new p();
            		for(parent in thiz){
            			p[parent] = thiz[parent];
            		}
            		return p;
            	};
            }

            function split(source,start){
            	var match;
            	var buf = [];
            	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
            	reg.lastIndex = start;
            	reg.exec(source);//skip <
            	while(match = reg.exec(source)){
            		buf.push(match);
            		if(match[1])return buf;
            	}
            }

            var XMLReader_1 = XMLReader;

            var sax = {
            	XMLReader: XMLReader_1
            };

            /*
             * DOM Level 2
             * Object DOMException
             * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
             * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
             */

            function copy(src,dest){
            	for(var p in src){
            		dest[p] = src[p];
            	}
            }
            /**
            ^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
            ^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
             */
            function _extends(Class,Super){
            	var pt = Class.prototype;
            	if(Object.create){
            		var ppt = Object.create(Super.prototype);
            		pt.__proto__ = ppt;
            	}
            	if(!(pt instanceof Super)){
            		function t(){}		t.prototype = Super.prototype;
            		t = new t();
            		copy(pt,t);
            		Class.prototype = pt = t;
            	}
            	if(pt.constructor != Class){
            		if(typeof Class != 'function'){
            			console.error("unknow Class:"+Class);
            		}
            		pt.constructor = Class;
            	}
            }
            var htmlns = 'http://www.w3.org/1999/xhtml' ;
            // Node Types
            var NodeType = {};
            var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
            var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
            var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
            var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
            var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
            var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
            var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
            var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
            var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
            var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
            var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
            var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

            // ExceptionCode
            var ExceptionCode = {};
            var ExceptionMessage = {};
            var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
            var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
            var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
            var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
            var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
            var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
            var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
            var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
            var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
            var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
            //level2
            var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
            var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
            var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
            var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
            var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);


            function DOMException(code, message) {
            	if(message instanceof Error){
            		var error = message;
            	}else{
            		error = this;
            		Error.call(this, ExceptionMessage[code]);
            		this.message = ExceptionMessage[code];
            		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
            	}
            	error.code = code;
            	if(message) this.message = this.message + ": " + message;
            	return error;
            }DOMException.prototype = Error.prototype;
            copy(ExceptionCode,DOMException);
            /**
             * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
             * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
             * The items in the NodeList are accessible via an integral index, starting from 0.
             */
            function NodeList() {
            }NodeList.prototype = {
            	/**
            	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
            	 * @standard level1
            	 */
            	length:0, 
            	/**
            	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
            	 * @standard level1
            	 * @param index  unsigned long 
            	 *   Index into the collection.
            	 * @return Node
            	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
            	 */
            	item: function(index) {
            		return this[index] || null;
            	},
            	toString:function(isHTML,nodeFilter){
            		for(var buf = [], i = 0;i<this.length;i++){
            			serializeToString(this[i],buf,isHTML,nodeFilter);
            		}
            		return buf.join('');
            	}
            };
            function LiveNodeList(node,refresh){
            	this._node = node;
            	this._refresh = refresh;
            	_updateLiveList(this);
            }
            function _updateLiveList(list){
            	var inc = list._node._inc || list._node.ownerDocument._inc;
            	if(list._inc != inc){
            		var ls = list._refresh(list._node);
            		//console.log(ls.length)
            		__set__(list,'length',ls.length);
            		copy(ls,list);
            		list._inc = inc;
            	}
            }
            LiveNodeList.prototype.item = function(i){
            	_updateLiveList(this);
            	return this[i];
            };

            _extends(LiveNodeList,NodeList);
            /**
             * 
             * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
             * NamedNodeMap objects in the DOM are live.
             * used for attributes or DocumentType entities 
             */
            function NamedNodeMap() {
            }
            function _findNodeIndex(list,node){
            	var i = list.length;
            	while(i--){
            		if(list[i] === node){return i}
            	}
            }

            function _addNamedNode(el,list,newAttr,oldAttr){
            	if(oldAttr){
            		list[_findNodeIndex(list,oldAttr)] = newAttr;
            	}else{
            		list[list.length++] = newAttr;
            	}
            	if(el){
            		newAttr.ownerElement = el;
            		var doc = el.ownerDocument;
            		if(doc){
            			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
            			_onAddAttribute(doc,el,newAttr);
            		}
            	}
            }
            function _removeNamedNode(el,list,attr){
            	//console.log('remove attr:'+attr)
            	var i = _findNodeIndex(list,attr);
            	if(i>=0){
            		var lastIndex = list.length-1;
            		while(i<lastIndex){
            			list[i] = list[++i];
            		}
            		list.length = lastIndex;
            		if(el){
            			var doc = el.ownerDocument;
            			if(doc){
            				_onRemoveAttribute(doc,el,attr);
            				attr.ownerElement = null;
            			}
            		}
            	}else{
            		throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
            	}
            }
            NamedNodeMap.prototype = {
            	length:0,
            	item:NodeList.prototype.item,
            	getNamedItem: function(key) {
            //		if(key.indexOf(':')>0 || key == 'xmlns'){
            //			return null;
            //		}
            		//console.log()
            		var i = this.length;
            		while(i--){
            			var attr = this[i];
            			//console.log(attr.nodeName,key)
            			if(attr.nodeName == key){
            				return attr;
            			}
            		}
            	},
            	setNamedItem: function(attr) {
            		var el = attr.ownerElement;
            		if(el && el!=this._ownerElement){
            			throw new DOMException(INUSE_ATTRIBUTE_ERR);
            		}
            		var oldAttr = this.getNamedItem(attr.nodeName);
            		_addNamedNode(this._ownerElement,this,attr,oldAttr);
            		return oldAttr;
            	},
            	/* returns Node */
            	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
            		var el = attr.ownerElement, oldAttr;
            		if(el && el!=this._ownerElement){
            			throw new DOMException(INUSE_ATTRIBUTE_ERR);
            		}
            		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
            		_addNamedNode(this._ownerElement,this,attr,oldAttr);
            		return oldAttr;
            	},

            	/* returns Node */
            	removeNamedItem: function(key) {
            		var attr = this.getNamedItem(key);
            		_removeNamedNode(this._ownerElement,this,attr);
            		return attr;
            		
            		
            	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
            	
            	//for level2
            	removeNamedItemNS:function(namespaceURI,localName){
            		var attr = this.getNamedItemNS(namespaceURI,localName);
            		_removeNamedNode(this._ownerElement,this,attr);
            		return attr;
            	},
            	getNamedItemNS: function(namespaceURI, localName) {
            		var i = this.length;
            		while(i--){
            			var node = this[i];
            			if(node.localName == localName && node.namespaceURI == namespaceURI){
            				return node;
            			}
            		}
            		return null;
            	}
            };
            /**
             * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
             */
            function DOMImplementation(/* Object */ features) {
            	this._features = {};
            	if (features) {
            		for (var feature in features) {
            			 this._features = features[feature];
            		}
            	}
            }
            DOMImplementation.prototype = {
            	hasFeature: function(/* string */ feature, /* string */ version) {
            		var versions = this._features[feature.toLowerCase()];
            		if (versions && (!version || version in versions)) {
            			return true;
            		} else {
            			return false;
            		}
            	},
            	// Introduced in DOM Level 2:
            	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
            		var doc = new Document();
            		doc.implementation = this;
            		doc.childNodes = new NodeList();
            		doc.doctype = doctype;
            		if(doctype){
            			doc.appendChild(doctype);
            		}
            		if(qualifiedName){
            			var root = doc.createElementNS(namespaceURI,qualifiedName);
            			doc.appendChild(root);
            		}
            		return doc;
            	},
            	// Introduced in DOM Level 2:
            	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
            		var node = new DocumentType();
            		node.name = qualifiedName;
            		node.nodeName = qualifiedName;
            		node.publicId = publicId;
            		node.systemId = systemId;
            		// Introduced in DOM Level 2:
            		//readonly attribute DOMString        internalSubset;
            		
            		//TODO:..
            		//  readonly attribute NamedNodeMap     entities;
            		//  readonly attribute NamedNodeMap     notations;
            		return node;
            	}
            };


            /**
             * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
             */

            function Node() {
            }
            Node.prototype = {
            	firstChild : null,
            	lastChild : null,
            	previousSibling : null,
            	nextSibling : null,
            	attributes : null,
            	parentNode : null,
            	childNodes : null,
            	ownerDocument : null,
            	nodeValue : null,
            	namespaceURI : null,
            	prefix : null,
            	localName : null,
            	// Modified in DOM Level 2:
            	insertBefore:function(newChild, refChild){//raises 
            		return _insertBefore(this,newChild,refChild);
            	},
            	replaceChild:function(newChild, oldChild){//raises 
            		this.insertBefore(newChild,oldChild);
            		if(oldChild){
            			this.removeChild(oldChild);
            		}
            	},
            	removeChild:function(oldChild){
            		return _removeChild(this,oldChild);
            	},
            	appendChild:function(newChild){
            		return this.insertBefore(newChild,null);
            	},
            	hasChildNodes:function(){
            		return this.firstChild != null;
            	},
            	cloneNode:function(deep){
            		return cloneNode(this.ownerDocument||this,this,deep);
            	},
            	// Modified in DOM Level 2:
            	normalize:function(){
            		var child = this.firstChild;
            		while(child){
            			var next = child.nextSibling;
            			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
            				this.removeChild(next);
            				child.appendData(next.data);
            			}else{
            				child.normalize();
            				child = next;
            			}
            		}
            	},
              	// Introduced in DOM Level 2:
            	isSupported:function(feature, version){
            		return this.ownerDocument.implementation.hasFeature(feature,version);
            	},
                // Introduced in DOM Level 2:
                hasAttributes:function(){
                	return this.attributes.length>0;
                },
                lookupPrefix:function(namespaceURI){
                	var el = this;
                	while(el){
                		var map = el._nsMap;
                		//console.dir(map)
                		if(map){
                			for(var n in map){
                				if(map[n] == namespaceURI){
                					return n;
                				}
                			}
                		}
                		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
                	}
                	return null;
                },
                // Introduced in DOM Level 3:
                lookupNamespaceURI:function(prefix){
                	var el = this;
                	while(el){
                		var map = el._nsMap;
                		//console.dir(map)
                		if(map){
                			if(prefix in map){
                				return map[prefix] ;
                			}
                		}
                		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
                	}
                	return null;
                },
                // Introduced in DOM Level 3:
                isDefaultNamespace:function(namespaceURI){
                	var prefix = this.lookupPrefix(namespaceURI);
                	return prefix == null;
                }
            };


            function _xmlEncoder(c){
            	return c == '<' && '&lt;' ||
                     c == '>' && '&gt;' ||
                     c == '&' && '&amp;' ||
                     c == '"' && '&quot;' ||
                     '&#'+c.charCodeAt()+';'
            }


            copy(NodeType,Node);
            copy(NodeType,Node.prototype);

            /**
             * @param callback return true for continue,false for break
             * @return boolean true: break visit;
             */
            function _visitNode(node,callback){
            	if(callback(node)){
            		return true;
            	}
            	if(node = node.firstChild){
            		do{
            			if(_visitNode(node,callback)){return true}
                    }while(node=node.nextSibling)
                }
            }



            function Document(){
            }
            function _onAddAttribute(doc,el,newAttr){
            	doc && doc._inc++;
            	var ns = newAttr.namespaceURI ;
            	if(ns == 'http://www.w3.org/2000/xmlns/'){
            		//update namespace
            		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value;
            	}
            }
            function _onRemoveAttribute(doc,el,newAttr,remove){
            	doc && doc._inc++;
            	var ns = newAttr.namespaceURI ;
            	if(ns == 'http://www.w3.org/2000/xmlns/'){
            		//update namespace
            		delete el._nsMap[newAttr.prefix?newAttr.localName:''];
            	}
            }
            function _onUpdateChild(doc,el,newChild){
            	if(doc && doc._inc){
            		doc._inc++;
            		//update childNodes
            		var cs = el.childNodes;
            		if(newChild){
            			cs[cs.length++] = newChild;
            		}else{
            			//console.log(1)
            			var child = el.firstChild;
            			var i = 0;
            			while(child){
            				cs[i++] = child;
            				child =child.nextSibling;
            			}
            			cs.length = i;
            		}
            	}
            }

            /**
             * attributes;
             * children;
             * 
             * writeable properties:
             * nodeValue,Attr:value,CharacterData:data
             * prefix
             */
            function _removeChild(parentNode,child){
            	var previous = child.previousSibling;
            	var next = child.nextSibling;
            	if(previous){
            		previous.nextSibling = next;
            	}else{
            		parentNode.firstChild = next;
            	}
            	if(next){
            		next.previousSibling = previous;
            	}else{
            		parentNode.lastChild = previous;
            	}
            	_onUpdateChild(parentNode.ownerDocument,parentNode);
            	return child;
            }
            /**
             * preformance key(refChild == null)
             */
            function _insertBefore(parentNode,newChild,nextChild){
            	var cp = newChild.parentNode;
            	if(cp){
            		cp.removeChild(newChild);//remove and update
            	}
            	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
            		var newFirst = newChild.firstChild;
            		if (newFirst == null) {
            			return newChild;
            		}
            		var newLast = newChild.lastChild;
            	}else{
            		newFirst = newLast = newChild;
            	}
            	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

            	newFirst.previousSibling = pre;
            	newLast.nextSibling = nextChild;
            	
            	
            	if(pre){
            		pre.nextSibling = newFirst;
            	}else{
            		parentNode.firstChild = newFirst;
            	}
            	if(nextChild == null){
            		parentNode.lastChild = newLast;
            	}else{
            		nextChild.previousSibling = newLast;
            	}
            	do{
            		newFirst.parentNode = parentNode;
            	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
            	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
            	//console.log(parentNode.lastChild.nextSibling == null)
            	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
            		newChild.firstChild = newChild.lastChild = null;
            	}
            	return newChild;
            }
            function _appendSingleChild(parentNode,newChild){
            	var cp = newChild.parentNode;
            	if(cp){
            		var pre = parentNode.lastChild;
            		cp.removeChild(newChild);//remove and update
            		var pre = parentNode.lastChild;
            	}
            	var pre = parentNode.lastChild;
            	newChild.parentNode = parentNode;
            	newChild.previousSibling = pre;
            	newChild.nextSibling = null;
            	if(pre){
            		pre.nextSibling = newChild;
            	}else{
            		parentNode.firstChild = newChild;
            	}
            	parentNode.lastChild = newChild;
            	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
            	return newChild;
            	//console.log("__aa",parentNode.lastChild.nextSibling == null)
            }
            Document.prototype = {
            	//implementation : null,
            	nodeName :  '#document',
            	nodeType :  DOCUMENT_NODE,
            	doctype :  null,
            	documentElement :  null,
            	_inc : 1,
            	
            	insertBefore :  function(newChild, refChild){//raises 
            		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
            			var child = newChild.firstChild;
            			while(child){
            				var next = child.nextSibling;
            				this.insertBefore(child,refChild);
            				child = next;
            			}
            			return newChild;
            		}
            		if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
            			this.documentElement = newChild;
            		}
            		
            		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
            	},
            	removeChild :  function(oldChild){
            		if(this.documentElement == oldChild){
            			this.documentElement = null;
            		}
            		return _removeChild(this,oldChild);
            	},
            	// Introduced in DOM Level 2:
            	importNode : function(importedNode,deep){
            		return importNode(this,importedNode,deep);
            	},
            	// Introduced in DOM Level 2:
            	getElementById :	function(id){
            		var rtv = null;
            		_visitNode(this.documentElement,function(node){
            			if(node.nodeType == ELEMENT_NODE){
            				if(node.getAttribute('id') == id){
            					rtv = node;
            					return true;
            				}
            			}
            		});
            		return rtv;
            	},
            	
            	//document factory method:
            	createElement :	function(tagName){
            		var node = new Element();
            		node.ownerDocument = this;
            		node.nodeName = tagName;
            		node.tagName = tagName;
            		node.childNodes = new NodeList();
            		var attrs	= node.attributes = new NamedNodeMap();
            		attrs._ownerElement = node;
            		return node;
            	},
            	createDocumentFragment :	function(){
            		var node = new DocumentFragment();
            		node.ownerDocument = this;
            		node.childNodes = new NodeList();
            		return node;
            	},
            	createTextNode :	function(data){
            		var node = new Text();
            		node.ownerDocument = this;
            		node.appendData(data);
            		return node;
            	},
            	createComment :	function(data){
            		var node = new Comment();
            		node.ownerDocument = this;
            		node.appendData(data);
            		return node;
            	},
            	createCDATASection :	function(data){
            		var node = new CDATASection();
            		node.ownerDocument = this;
            		node.appendData(data);
            		return node;
            	},
            	createProcessingInstruction :	function(target,data){
            		var node = new ProcessingInstruction();
            		node.ownerDocument = this;
            		node.tagName = node.target = target;
            		node.nodeValue= node.data = data;
            		return node;
            	},
            	createAttribute :	function(name){
            		var node = new Attr();
            		node.ownerDocument	= this;
            		node.name = name;
            		node.nodeName	= name;
            		node.localName = name;
            		node.specified = true;
            		return node;
            	},
            	createEntityReference :	function(name){
            		var node = new EntityReference();
            		node.ownerDocument	= this;
            		node.nodeName	= name;
            		return node;
            	},
            	// Introduced in DOM Level 2:
            	createElementNS :	function(namespaceURI,qualifiedName){
            		var node = new Element();
            		var pl = qualifiedName.split(':');
            		var attrs	= node.attributes = new NamedNodeMap();
            		node.childNodes = new NodeList();
            		node.ownerDocument = this;
            		node.nodeName = qualifiedName;
            		node.tagName = qualifiedName;
            		node.namespaceURI = namespaceURI;
            		if(pl.length == 2){
            			node.prefix = pl[0];
            			node.localName = pl[1];
            		}else{
            			//el.prefix = null;
            			node.localName = qualifiedName;
            		}
            		attrs._ownerElement = node;
            		return node;
            	},
            	// Introduced in DOM Level 2:
            	createAttributeNS :	function(namespaceURI,qualifiedName){
            		var node = new Attr();
            		var pl = qualifiedName.split(':');
            		node.ownerDocument = this;
            		node.nodeName = qualifiedName;
            		node.name = qualifiedName;
            		node.namespaceURI = namespaceURI;
            		node.specified = true;
            		if(pl.length == 2){
            			node.prefix = pl[0];
            			node.localName = pl[1];
            		}else{
            			//el.prefix = null;
            			node.localName = qualifiedName;
            		}
            		return node;
            	}
            };
            _extends(Document,Node);


            function Element() {
            	this._nsMap = {};
            }Element.prototype = {
            	nodeType : ELEMENT_NODE,
            	hasAttribute : function(name){
            		return this.getAttributeNode(name)!=null;
            	},
            	getAttribute : function(name){
            		var attr = this.getAttributeNode(name);
            		return attr && attr.value || '';
            	},
            	getAttributeNode : function(name){
            		return this.attributes.getNamedItem(name);
            	},
            	setAttribute : function(name, value){
            		var attr = this.ownerDocument.createAttribute(name);
            		attr.value = attr.nodeValue = "" + value;
            		this.setAttributeNode(attr);
            	},
            	removeAttribute : function(name){
            		var attr = this.getAttributeNode(name);
            		attr && this.removeAttributeNode(attr);
            	},
            	
            	//four real opeartion method
            	appendChild:function(newChild){
            		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
            			return this.insertBefore(newChild,null);
            		}else{
            			return _appendSingleChild(this,newChild);
            		}
            	},
            	setAttributeNode : function(newAttr){
            		return this.attributes.setNamedItem(newAttr);
            	},
            	setAttributeNodeNS : function(newAttr){
            		return this.attributes.setNamedItemNS(newAttr);
            	},
            	removeAttributeNode : function(oldAttr){
            		//console.log(this == oldAttr.ownerElement)
            		return this.attributes.removeNamedItem(oldAttr.nodeName);
            	},
            	//get real attribute name,and remove it by removeAttributeNode
            	removeAttributeNS : function(namespaceURI, localName){
            		var old = this.getAttributeNodeNS(namespaceURI, localName);
            		old && this.removeAttributeNode(old);
            	},
            	
            	hasAttributeNS : function(namespaceURI, localName){
            		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
            	},
            	getAttributeNS : function(namespaceURI, localName){
            		var attr = this.getAttributeNodeNS(namespaceURI, localName);
            		return attr && attr.value || '';
            	},
            	setAttributeNS : function(namespaceURI, qualifiedName, value){
            		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
            		attr.value = attr.nodeValue = "" + value;
            		this.setAttributeNode(attr);
            	},
            	getAttributeNodeNS : function(namespaceURI, localName){
            		return this.attributes.getNamedItemNS(namespaceURI, localName);
            	},
            	
            	getElementsByTagName : function(tagName){
            		return new LiveNodeList(this,function(base){
            			var ls = [];
            			_visitNode(base,function(node){
            				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
            					ls.push(node);
            				}
            			});
            			return ls;
            		});
            	},
            	getElementsByTagNameNS : function(namespaceURI, localName){
            		return new LiveNodeList(this,function(base){
            			var ls = [];
            			_visitNode(base,function(node){
            				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
            					ls.push(node);
            				}
            			});
            			return ls;
            			
            		});
            	}
            };
            Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
            Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


            _extends(Element,Node);
            function Attr() {
            }Attr.prototype.nodeType = ATTRIBUTE_NODE;
            _extends(Attr,Node);


            function CharacterData() {
            }CharacterData.prototype = {
            	data : '',
            	substringData : function(offset, count) {
            		return this.data.substring(offset, offset+count);
            	},
            	appendData: function(text) {
            		text = this.data+text;
            		this.nodeValue = this.data = text;
            		this.length = text.length;
            	},
            	insertData: function(offset,text) {
            		this.replaceData(offset,0,text);
            	
            	},
            	appendChild:function(newChild){
            		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
            	},
            	deleteData: function(offset, count) {
            		this.replaceData(offset,count,"");
            	},
            	replaceData: function(offset, count, text) {
            		var start = this.data.substring(0,offset);
            		var end = this.data.substring(offset+count);
            		text = start + text + end;
            		this.nodeValue = this.data = text;
            		this.length = text.length;
            	}
            };
            _extends(CharacterData,Node);
            function Text() {
            }Text.prototype = {
            	nodeName : "#text",
            	nodeType : TEXT_NODE,
            	splitText : function(offset) {
            		var text = this.data;
            		var newText = text.substring(offset);
            		text = text.substring(0, offset);
            		this.data = this.nodeValue = text;
            		this.length = text.length;
            		var newNode = this.ownerDocument.createTextNode(newText);
            		if(this.parentNode){
            			this.parentNode.insertBefore(newNode, this.nextSibling);
            		}
            		return newNode;
            	}
            };
            _extends(Text,CharacterData);
            function Comment() {
            }Comment.prototype = {
            	nodeName : "#comment",
            	nodeType : COMMENT_NODE
            };
            _extends(Comment,CharacterData);

            function CDATASection() {
            }CDATASection.prototype = {
            	nodeName : "#cdata-section",
            	nodeType : CDATA_SECTION_NODE
            };
            _extends(CDATASection,CharacterData);


            function DocumentType() {
            }DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
            _extends(DocumentType,Node);

            function Notation() {
            }Notation.prototype.nodeType = NOTATION_NODE;
            _extends(Notation,Node);

            function Entity() {
            }Entity.prototype.nodeType = ENTITY_NODE;
            _extends(Entity,Node);

            function EntityReference() {
            }EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
            _extends(EntityReference,Node);

            function DocumentFragment() {
            }DocumentFragment.prototype.nodeName =	"#document-fragment";
            DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
            _extends(DocumentFragment,Node);


            function ProcessingInstruction() {
            }
            ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
            _extends(ProcessingInstruction,Node);
            function XMLSerializer(){}
            XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
            	return nodeSerializeToString.call(node,isHtml,nodeFilter);
            };
            Node.prototype.toString = nodeSerializeToString;
            function nodeSerializeToString(isHtml,nodeFilter){
            	var buf = [];
            	var refNode = this.nodeType == 9?this.documentElement:this;
            	var prefix = refNode.prefix;
            	var uri = refNode.namespaceURI;
            	
            	if(uri && prefix == null){
            		//console.log(prefix)
            		var prefix = refNode.lookupPrefix(uri);
            		if(prefix == null){
            			//isHTML = true;
            			var visibleNamespaces=[
            			{namespace:uri,prefix:null}
            			//{namespace:uri,prefix:''}
            			];
            		}
            	}
            	serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
            	//console.log('###',this.nodeType,uri,prefix,buf.join(''))
            	return buf.join('');
            }
            function needNamespaceDefine(node,isHTML, visibleNamespaces) {
            	var prefix = node.prefix||'';
            	var uri = node.namespaceURI;
            	if (!prefix && !uri){
            		return false;
            	}
            	if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
            		|| uri == 'http://www.w3.org/2000/xmlns/'){
            		return false;
            	}
            	
            	var i = visibleNamespaces.length; 
            	//console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
            	while (i--) {
            		var ns = visibleNamespaces[i];
            		// get namespace prefix
            		//console.log(node.nodeType,node.tagName,ns.prefix,prefix)
            		if (ns.prefix == prefix){
            			return ns.namespace != uri;
            		}
            	}
            	//console.log(isHTML,uri,prefix=='')
            	//if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
            	//	return false;
            	//}
            	//node.flag = '11111'
            	//console.error(3,true,node.flag,node.prefix,node.namespaceURI)
            	return true;
            }
            function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
            	if(nodeFilter){
            		node = nodeFilter(node);
            		if(node){
            			if(typeof node == 'string'){
            				buf.push(node);
            				return;
            			}
            		}else{
            			return;
            		}
            		//buf.sort.apply(attrs, attributeSorter);
            	}
            	switch(node.nodeType){
            	case ELEMENT_NODE:
            		if (!visibleNamespaces) visibleNamespaces = [];
            		var startVisibleNamespaces = visibleNamespaces.length;
            		var attrs = node.attributes;
            		var len = attrs.length;
            		var child = node.firstChild;
            		var nodeName = node.tagName;
            		
            		isHTML =  (htmlns === node.namespaceURI) ||isHTML; 
            		buf.push('<',nodeName);
            		
            		
            		
            		for(var i=0;i<len;i++){
            			// add namespaces for attributes
            			var attr = attrs.item(i);
            			if (attr.prefix == 'xmlns') {
            				visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
            			}else if(attr.nodeName == 'xmlns'){
            				visibleNamespaces.push({ prefix: '', namespace: attr.value });
            			}
            		}
            		for(var i=0;i<len;i++){
            			var attr = attrs.item(i);
            			if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
            				var prefix = attr.prefix||'';
            				var uri = attr.namespaceURI;
            				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
            				buf.push(ns, '="' , uri , '"');
            				visibleNamespaces.push({ prefix: prefix, namespace:uri });
            			}
            			serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
            		}
            		// add namespace for current node		
            		if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
            			var prefix = node.prefix||'';
            			var uri = node.namespaceURI;
            			var ns = prefix ? ' xmlns:' + prefix : " xmlns";
            			buf.push(ns, '="' , uri , '"');
            			visibleNamespaces.push({ prefix: prefix, namespace:uri });
            		}
            		
            		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
            			buf.push('>');
            			//if is cdata child node
            			if(isHTML && /^script$/i.test(nodeName)){
            				while(child){
            					if(child.data){
            						buf.push(child.data);
            					}else{
            						serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
            					}
            					child = child.nextSibling;
            				}
            			}else
            			{
            				while(child){
            					serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
            					child = child.nextSibling;
            				}
            			}
            			buf.push('</',nodeName,'>');
            		}else{
            			buf.push('/>');
            		}
            		// remove added visible namespaces
            		//visibleNamespaces.length = startVisibleNamespaces;
            		return;
            	case DOCUMENT_NODE:
            	case DOCUMENT_FRAGMENT_NODE:
            		var child = node.firstChild;
            		while(child){
            			serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
            			child = child.nextSibling;
            		}
            		return;
            	case ATTRIBUTE_NODE:
            		return buf.push(' ',node.name,'="',node.value.replace(/[<&"]/g,_xmlEncoder),'"');
            	case TEXT_NODE:
            		return buf.push(node.data.replace(/[<&]/g,_xmlEncoder));
            	case CDATA_SECTION_NODE:
            		return buf.push( '<![CDATA[',node.data,']]>');
            	case COMMENT_NODE:
            		return buf.push( "<!--",node.data,"-->");
            	case DOCUMENT_TYPE_NODE:
            		var pubid = node.publicId;
            		var sysid = node.systemId;
            		buf.push('<!DOCTYPE ',node.name);
            		if(pubid){
            			buf.push(' PUBLIC "',pubid);
            			if (sysid && sysid!='.') {
            				buf.push( '" "',sysid);
            			}
            			buf.push('">');
            		}else if(sysid && sysid!='.'){
            			buf.push(' SYSTEM "',sysid,'">');
            		}else{
            			var sub = node.internalSubset;
            			if(sub){
            				buf.push(" [",sub,"]");
            			}
            			buf.push(">");
            		}
            		return;
            	case PROCESSING_INSTRUCTION_NODE:
            		return buf.push( "<?",node.target," ",node.data,"?>");
            	case ENTITY_REFERENCE_NODE:
            		return buf.push( '&',node.nodeName,';');
            	//case ENTITY_NODE:
            	//case NOTATION_NODE:
            	default:
            		buf.push('??',node.nodeName);
            	}
            }
            function importNode(doc,node,deep){
            	var node2;
            	switch (node.nodeType) {
            	case ELEMENT_NODE:
            		node2 = node.cloneNode(false);
            		node2.ownerDocument = doc;
            		//var attrs = node2.attributes;
            		//var len = attrs.length;
            		//for(var i=0;i<len;i++){
            			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
            		//}
            	case DOCUMENT_FRAGMENT_NODE:
            		break;
            	case ATTRIBUTE_NODE:
            		deep = true;
            		break;
            	//case ENTITY_REFERENCE_NODE:
            	//case PROCESSING_INSTRUCTION_NODE:
            	////case TEXT_NODE:
            	//case CDATA_SECTION_NODE:
            	//case COMMENT_NODE:
            	//	deep = false;
            	//	break;
            	//case DOCUMENT_NODE:
            	//case DOCUMENT_TYPE_NODE:
            	//cannot be imported.
            	//case ENTITY_NODE:
            	//case NOTATION_NODE：
            	//can not hit in level3
            	//default:throw e;
            	}
            	if(!node2){
            		node2 = node.cloneNode(false);//false
            	}
            	node2.ownerDocument = doc;
            	node2.parentNode = null;
            	if(deep){
            		var child = node.firstChild;
            		while(child){
            			node2.appendChild(importNode(doc,child,deep));
            			child = child.nextSibling;
            		}
            	}
            	return node2;
            }
            //
            //var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
            //					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
            function cloneNode(doc,node,deep){
            	var node2 = new node.constructor();
            	for(var n in node){
            		var v = node[n];
            		if(typeof v != 'object' ){
            			if(v != node2[n]){
            				node2[n] = v;
            			}
            		}
            	}
            	if(node.childNodes){
            		node2.childNodes = new NodeList();
            	}
            	node2.ownerDocument = doc;
            	switch (node2.nodeType) {
            	case ELEMENT_NODE:
            		var attrs	= node.attributes;
            		var attrs2	= node2.attributes = new NamedNodeMap();
            		var len = attrs.length;
            		attrs2._ownerElement = node2;
            		for(var i=0;i<len;i++){
            			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
            		}
            		break;
            	case ATTRIBUTE_NODE:
            		deep = true;
            	}
            	if(deep){
            		var child = node.firstChild;
            		while(child){
            			node2.appendChild(cloneNode(doc,child,deep));
            			child = child.nextSibling;
            		}
            	}
            	return node2;
            }

            function __set__(object,key,value){
            	object[key] = value;
            }
            //do dynamic
            try{
            	if(Object.defineProperty){
            		Object.defineProperty(LiveNodeList.prototype,'length',{
            			get:function(){
            				_updateLiveList(this);
            				return this.$$length;
            			}
            		});
            		Object.defineProperty(Node.prototype,'textContent',{
            			get:function(){
            				return getTextContent(this);
            			},
            			set:function(data){
            				switch(this.nodeType){
            				case ELEMENT_NODE:
            				case DOCUMENT_FRAGMENT_NODE:
            					while(this.firstChild){
            						this.removeChild(this.firstChild);
            					}
            					if(data || String(data)){
            						this.appendChild(this.ownerDocument.createTextNode(data));
            					}
            					break;
            				default:
            					//TODO:
            					this.data = data;
            					this.value = data;
            					this.nodeValue = data;
            				}
            			}
            		});
            		
            		function getTextContent(node){
            			switch(node.nodeType){
            			case ELEMENT_NODE:
            			case DOCUMENT_FRAGMENT_NODE:
            				var buf = [];
            				node = node.firstChild;
            				while(node){
            					if(node.nodeType!==7 && node.nodeType !==8){
            						buf.push(getTextContent(node));
            					}
            					node = node.nextSibling;
            				}
            				return buf.join('');
            			default:
            				return node.nodeValue;
            			}
            		}
            		__set__ = function(object,key,value){
            			//console.log(value)
            			object['$$'+key] = value;
            		};
            	}
            }catch(e){//ie8
            }

            //if(typeof require == 'function'){
            	var DOMImplementation_1 = DOMImplementation;
            	var XMLSerializer_1 = XMLSerializer;
            //}

            var dom = {
            	DOMImplementation: DOMImplementation_1,
            	XMLSerializer: XMLSerializer_1
            };

            var domParser = createCommonjsModule(function (module, exports) {
            function DOMParser(options){
            	this.options = options ||{locator:{}};
            	
            }
            DOMParser.prototype.parseFromString = function(source,mimeType){
            	var options = this.options;
            	var sax$$1 =  new XMLReader();
            	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
            	var errorHandler = options.errorHandler;
            	var locator = options.locator;
            	var defaultNSMap = options.xmlns||{};
            	var entityMap = {'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"};
            	if(locator){
            		domBuilder.setDocumentLocator(locator);
            	}
            	
            	sax$$1.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
            	sax$$1.domBuilder = options.domBuilder || domBuilder;
            	if(/\/x?html?$/.test(mimeType)){
            		entityMap.nbsp = '\xa0';
            		entityMap.copy = '\xa9';
            		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
            	}
            	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
            	if(source){
            		sax$$1.parse(source,defaultNSMap,entityMap);
            	}else{
            		sax$$1.errorHandler.error("invalid doc source");
            	}
            	return domBuilder.doc;
            };
            function buildErrorHandler(errorImpl,domBuilder,locator){
            	if(!errorImpl){
            		if(domBuilder instanceof DOMHandler){
            			return domBuilder;
            		}
            		errorImpl = domBuilder ;
            	}
            	var errorHandler = {};
            	var isCallback = errorImpl instanceof Function;
            	locator = locator||{};
            	function build(key){
            		var fn = errorImpl[key];
            		if(!fn && isCallback){
            			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg);}:errorImpl;
            		}
            		errorHandler[key] = fn && function(msg){
            			fn('[xmldom '+key+']\t'+msg+_locator(locator));
            		}||function(){};
            	}
            	build('warning');
            	build('error');
            	build('fatalError');
            	return errorHandler;
            }

            //console.log('#\n\n\n\n\n\n\n####')
            /**
             * +ContentHandler+ErrorHandler
             * +LexicalHandler+EntityResolver2
             * -DeclHandler-DTDHandler 
             * 
             * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
             * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
             * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
             */
            function DOMHandler() {
                this.cdata = false;
            }
            function position(locator,node){
            	node.lineNumber = locator.lineNumber;
            	node.columnNumber = locator.columnNumber;
            }
            /**
             * @see org.xml.sax.ContentHandler#startDocument
             * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
             */ 
            DOMHandler.prototype = {
            	startDocument : function() {
                	this.doc = new DOMImplementation().createDocument(null, null, null);
                	if (this.locator) {
                    	this.doc.documentURI = this.locator.systemId;
                	}
            	},
            	startElement:function(namespaceURI, localName, qName, attrs) {
            		var doc = this.doc;
            	    var el = doc.createElementNS(namespaceURI, qName||localName);
            	    var len = attrs.length;
            	    appendElement(this, el);
            	    this.currentElement = el;
            	    
            		this.locator && position(this.locator,el);
            	    for (var i = 0 ; i < len; i++) {
            	        var namespaceURI = attrs.getURI(i);
            	        var value = attrs.getValue(i);
            	        var qName = attrs.getQName(i);
            			var attr = doc.createAttributeNS(namespaceURI, qName);
            			this.locator &&position(attrs.getLocator(i),attr);
            			attr.value = attr.nodeValue = value;
            			el.setAttributeNode(attr);
            	    }
            	},
            	endElement:function(namespaceURI, localName, qName) {
            		var current = this.currentElement;
            		var tagName = current.tagName;
            		this.currentElement = current.parentNode;
            	},
            	startPrefixMapping:function(prefix, uri) {
            	},
            	endPrefixMapping:function(prefix) {
            	},
            	processingInstruction:function(target, data) {
            	    var ins = this.doc.createProcessingInstruction(target, data);
            	    this.locator && position(this.locator,ins);
            	    appendElement(this, ins);
            	},
            	ignorableWhitespace:function(ch, start, length) {
            	},
            	characters:function(chars, start, length) {
            		chars = _toString.apply(this,arguments);
            		//console.log(chars)
            		if(chars){
            			if (this.cdata) {
            				var charNode = this.doc.createCDATASection(chars);
            			} else {
            				var charNode = this.doc.createTextNode(chars);
            			}
            			if(this.currentElement){
            				this.currentElement.appendChild(charNode);
            			}else if(/^\s*$/.test(chars)){
            				this.doc.appendChild(charNode);
            				//process xml
            			}
            			this.locator && position(this.locator,charNode);
            		}
            	},
            	skippedEntity:function(name) {
            	},
            	endDocument:function() {
            		this.doc.normalize();
            	},
            	setDocumentLocator:function (locator) {
            	    if(this.locator = locator){// && !('lineNumber' in locator)){
            	    	locator.lineNumber = 0;
            	    }
            	},
            	//LexicalHandler
            	comment:function(chars, start, length) {
            		chars = _toString.apply(this,arguments);
            	    var comm = this.doc.createComment(chars);
            	    this.locator && position(this.locator,comm);
            	    appendElement(this, comm);
            	},
            	
            	startCDATA:function() {
            	    //used in characters() methods
            	    this.cdata = true;
            	},
            	endCDATA:function() {
            	    this.cdata = false;
            	},
            	
            	startDTD:function(name, publicId, systemId) {
            		var impl = this.doc.implementation;
            	    if (impl && impl.createDocumentType) {
            	        var dt = impl.createDocumentType(name, publicId, systemId);
            	        this.locator && position(this.locator,dt);
            	        appendElement(this, dt);
            	    }
            	},
            	/**
            	 * @see org.xml.sax.ErrorHandler
            	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
            	 */
            	warning:function(error) {
            		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
            	},
            	error:function(error) {
            		console.error('[xmldom error]\t'+error,_locator(this.locator));
            	},
            	fatalError:function(error) {
            		console.error('[xmldom fatalError]\t'+error,_locator(this.locator));
            	    throw error;
            	}
            };
            function _locator(l){
            	if(l){
            		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
            	}
            }
            function _toString(chars,start,length){
            	if(typeof chars == 'string'){
            		return chars.substr(start,length)
            	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
            		if(chars.length >= start+length || start){
            			return new java.lang.String(chars,start,length)+'';
            		}
            		return chars;
            	}
            }

            /*
             * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
             * used method of org.xml.sax.ext.LexicalHandler:
             *  #comment(chars, start, length)
             *  #startCDATA()
             *  #endCDATA()
             *  #startDTD(name, publicId, systemId)
             *
             *
             * IGNORED method of org.xml.sax.ext.LexicalHandler:
             *  #endDTD()
             *  #startEntity(name)
             *  #endEntity(name)
             *
             *
             * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
             * IGNORED method of org.xml.sax.ext.DeclHandler
             * 	#attributeDecl(eName, aName, type, mode, value)
             *  #elementDecl(name, model)
             *  #externalEntityDecl(name, publicId, systemId)
             *  #internalEntityDecl(name, value)
             * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
             * IGNORED method of org.xml.sax.EntityResolver2
             *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
             *  #resolveEntity(publicId, systemId)
             *  #getExternalSubset(name, baseURI)
             * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
             * IGNORED method of org.xml.sax.DTDHandler
             *  #notationDecl(name, publicId, systemId) {};
             *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
             */
            "endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
            	DOMHandler.prototype[key] = function(){return null};
            });

            /* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
            function appendElement (hander,node) {
                if (!hander.currentElement) {
                    hander.doc.appendChild(node);
                } else {
                    hander.currentElement.appendChild(node);
                }
            }//appendChild and setAttributeNS are preformance key

            //if(typeof require == 'function'){
            	var XMLReader = sax.XMLReader;
            	var DOMImplementation = exports.DOMImplementation = dom.DOMImplementation;
            	exports.XMLSerializer = dom.XMLSerializer ;
            	exports.DOMParser = DOMParser;
            //}
            });
            var domParser_1 = domParser.DOMImplementation;
            var domParser_2 = domParser.XMLSerializer;
            var domParser_3 = domParser.DOMParser;

            /**
             * Module dependencies.
             */

            var DOMParser = domParser.DOMParser;

            /**
             * Module exports.
             */

            var parse_2 = parse$1;

            var TEXT_NODE$1 = 3;
            var CDATA_NODE = 4;
            var COMMENT_NODE$1 = 8;


            /**
             * We ignore raw text (usually whitespace), <!-- xml comments -->,
             * and raw CDATA nodes.
             *
             * @param {Element} node
             * @returns {Boolean}
             * @api private
             */

            function shouldIgnoreNode (node) {
              return node.nodeType === TEXT_NODE$1
                || node.nodeType === COMMENT_NODE$1
                || node.nodeType === CDATA_NODE;
            }

            /**
             * Check if the node is empty. Some plist file has such node:
             * <key />
             * this node shoud be ignored.
             *
             * @see https://github.com/TooTallNate/plist.js/issues/66
             * @param {Element} node
             * @returns {Boolean}
             * @api private
             */
            function isEmptyNode(node){
              if(!node.childNodes || node.childNodes.length === 0) {
                return true;
              } else {
                return false;
              }
            }

            function invariant(test, message) {
              if (!test) {
                throw new Error(message);
              }
            }

            /**
             * Parses a Plist XML string. Returns an Object.
             *
             * @param {String} xml - the XML String to decode
             * @returns {Mixed} the decoded value from the Plist XML
             * @api public
             */

            function parse$1 (xml) {
              var doc = new DOMParser().parseFromString(xml);
              invariant(
                doc.documentElement.nodeName === 'plist',
                'malformed document. First element should be <plist>'
              );
              var plist = parsePlistXML(doc.documentElement);

              // the root <plist> node gets interpreted as an Array,
              // so pull out the inner data first
              if (plist.length == 1) plist = plist[0];

              return plist;
            }

            /**
             * Convert an XML based plist document into a JSON representation.
             *
             * @param {Object} xml_node - current XML node in the plist
             * @returns {Mixed} built up JSON object
             * @api private
             */

            function parsePlistXML (node) {
              var i, new_obj, key, new_arr, res, counter, type;

              if (!node)
                return null;

              if (node.nodeName === 'plist') {
                new_arr = [];
                if (isEmptyNode(node)) {
                  return new_arr;
                }
                for (i=0; i < node.childNodes.length; i++) {
                  if (!shouldIgnoreNode(node.childNodes[i])) {
                    new_arr.push( parsePlistXML(node.childNodes[i]));
                  }
                }
                return new_arr;
              } else if (node.nodeName === 'dict') {
                new_obj = {};
                key = null;
                counter = 0;
                if (isEmptyNode(node)) {
                  return new_obj;
                }
                for (i=0; i < node.childNodes.length; i++) {
                  if (shouldIgnoreNode(node.childNodes[i])) continue;
                  if (counter % 2 === 0) {
                    invariant(
                      node.childNodes[i].nodeName === 'key',
                      'Missing key while parsing <dict/>.'
                    );
                    key = parsePlistXML(node.childNodes[i]);
                  } else {
                    invariant(
                      node.childNodes[i].nodeName !== 'key',
                      'Unexpected key "'
                        + parsePlistXML(node.childNodes[i])
                        + '" while parsing <dict/>.'
                    );
                    new_obj[key] = parsePlistXML(node.childNodes[i]);
                  }
                  counter += 1;
                }
                if (counter % 2 === 1) {
                  throw new Error('Missing value for "' + key + '" while parsing <dict/>');
                }
                return new_obj;

              } else if (node.nodeName === 'array') {
                new_arr = [];
                if (isEmptyNode(node)) {
                  return new_arr;
                }
                for (i=0; i < node.childNodes.length; i++) {
                  if (!shouldIgnoreNode(node.childNodes[i])) {
                    res = parsePlistXML(node.childNodes[i]);
                    if (null != res) new_arr.push(res);
                  }
                }
                return new_arr;

              } else if (node.nodeName === '#text') ; else if (node.nodeName === 'key') {
                if (isEmptyNode(node)) {
                  return '';
                }
                return node.childNodes[0].nodeValue;
              } else if (node.nodeName === 'string') {
                res = '';
                if (isEmptyNode(node)) {
                  return res;
                }
                for (i=0; i < node.childNodes.length; i++) {
                  var type = node.childNodes[i].nodeType;
                  if (type === TEXT_NODE$1 || type === CDATA_NODE) {
                    res += node.childNodes[i].nodeValue;
                  }
                }
                return res;

              } else if (node.nodeName === 'integer') {
                invariant(
                  !isEmptyNode(node),
                  'Cannot parse "" as integer.'
                );
                return parseInt(node.childNodes[0].nodeValue, 10);

              } else if (node.nodeName === 'real') {
                invariant(
                  !isEmptyNode(node),
                  'Cannot parse "" as real.'
                );
                res = '';
                for (i=0; i < node.childNodes.length; i++) {
                  if (node.childNodes[i].nodeType === TEXT_NODE$1) {
                    res += node.childNodes[i].nodeValue;
                  }
                }
                return parseFloat(res);

              } else if (node.nodeName === 'data') {
                res = '';
                if (isEmptyNode(node)) {
                  return Buffer.from(res, 'base64');
                }
                for (i=0; i < node.childNodes.length; i++) {
                  if (node.childNodes[i].nodeType === TEXT_NODE$1) {
                    res += node.childNodes[i].nodeValue.replace(/\s+/g, '');
                  }
                }
                return Buffer.from(res, 'base64');

              } else if (node.nodeName === 'date') {
                invariant(
                  !isEmptyNode(node),
                  'Cannot parse "" as Date.'
                );
                return new Date(node.childNodes[0].nodeValue);

              } else if (node.nodeName === 'true') {
                return true;

              } else if (node.nodeName === 'false') {
                return false;
              }
            }

            var domain;

            // This constructor is used to store event handlers. Instantiating this is
            // faster than explicitly calling `Object.create(null)` to get a "clean" empty
            // object (tested with v8 v4.9).
            function EventHandlers() {}
            EventHandlers.prototype = Object.create(null);

            function EventEmitter() {
              EventEmitter.init.call(this);
            }

            // nodejs oddity
            // require('events') === require('events').EventEmitter
            EventEmitter.EventEmitter = EventEmitter;

            EventEmitter.usingDomains = false;

            EventEmitter.prototype.domain = undefined;
            EventEmitter.prototype._events = undefined;
            EventEmitter.prototype._maxListeners = undefined;

            // By default EventEmitters will print a warning if more than 10 listeners are
            // added to it. This is a useful default which helps finding memory leaks.
            EventEmitter.defaultMaxListeners = 10;

            EventEmitter.init = function() {
              this.domain = null;
              if (EventEmitter.usingDomains) {
                // if there is an active domain, then attach to it.
                if (domain.active) ;
              }

              if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
                this._events = new EventHandlers();
                this._eventsCount = 0;
              }

              this._maxListeners = this._maxListeners || undefined;
            };

            // Obviously not all Emitters should be limited to 10. This function allows
            // that to be increased. Set to zero for unlimited.
            EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
              if (typeof n !== 'number' || n < 0 || isNaN(n))
                throw new TypeError('"n" argument must be a positive number');
              this._maxListeners = n;
              return this;
            };

            function $getMaxListeners(that) {
              if (that._maxListeners === undefined)
                return EventEmitter.defaultMaxListeners;
              return that._maxListeners;
            }

            EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
              return $getMaxListeners(this);
            };

            // These standalone emit* functions are used to optimize calling of event
            // handlers for fast cases because emit() itself often has a variable number of
            // arguments and can be deoptimized because of that. These functions always have
            // the same number of arguments and thus do not get deoptimized, so the code
            // inside them can execute faster.
            function emitNone(handler, isFn, self) {
              if (isFn)
                handler.call(self);
              else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                  listeners[i].call(self);
              }
            }
            function emitOne(handler, isFn, self, arg1) {
              if (isFn)
                handler.call(self, arg1);
              else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                  listeners[i].call(self, arg1);
              }
            }
            function emitTwo(handler, isFn, self, arg1, arg2) {
              if (isFn)
                handler.call(self, arg1, arg2);
              else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                  listeners[i].call(self, arg1, arg2);
              }
            }
            function emitThree(handler, isFn, self, arg1, arg2, arg3) {
              if (isFn)
                handler.call(self, arg1, arg2, arg3);
              else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                  listeners[i].call(self, arg1, arg2, arg3);
              }
            }

            function emitMany(handler, isFn, self, args) {
              if (isFn)
                handler.apply(self, args);
              else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                  listeners[i].apply(self, args);
              }
            }

            EventEmitter.prototype.emit = function emit(type) {
              var er, handler, len, args, i, events, domain;
              var doError = (type === 'error');

              events = this._events;
              if (events)
                doError = (doError && events.error == null);
              else if (!doError)
                return false;

              domain = this.domain;

              // If there is no 'error' event listener then throw.
              if (doError) {
                er = arguments[1];
                if (domain) {
                  if (!er)
                    er = new Error('Uncaught, unspecified "error" event');
                  er.domainEmitter = this;
                  er.domain = domain;
                  er.domainThrown = false;
                  domain.emit('error', er);
                } else if (er instanceof Error) {
                  throw er; // Unhandled 'error' event
                } else {
                  // At least give some kind of context to the user
                  var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
                  err.context = er;
                  throw err;
                }
                return false;
              }

              handler = events[type];

              if (!handler)
                return false;

              var isFn = typeof handler === 'function';
              len = arguments.length;
              switch (len) {
                // fast cases
                case 1:
                  emitNone(handler, isFn, this);
                  break;
                case 2:
                  emitOne(handler, isFn, this, arguments[1]);
                  break;
                case 3:
                  emitTwo(handler, isFn, this, arguments[1], arguments[2]);
                  break;
                case 4:
                  emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
                  break;
                // slower
                default:
                  args = new Array(len - 1);
                  for (i = 1; i < len; i++)
                    args[i - 1] = arguments[i];
                  emitMany(handler, isFn, this, args);
              }

              return true;
            };

            function _addListener(target, type, listener, prepend) {
              var m;
              var events;
              var existing;

              if (typeof listener !== 'function')
                throw new TypeError('"listener" argument must be a function');

              events = target._events;
              if (!events) {
                events = target._events = new EventHandlers();
                target._eventsCount = 0;
              } else {
                // To avoid recursion in the case that type === "newListener"! Before
                // adding it to the listeners, first emit "newListener".
                if (events.newListener) {
                  target.emit('newListener', type,
                              listener.listener ? listener.listener : listener);

                  // Re-assign `events` because a newListener handler could have caused the
                  // this._events to be assigned to a new object
                  events = target._events;
                }
                existing = events[type];
              }

              if (!existing) {
                // Optimize the case of one listener. Don't need the extra array object.
                existing = events[type] = listener;
                ++target._eventsCount;
              } else {
                if (typeof existing === 'function') {
                  // Adding the second element, need to change to array.
                  existing = events[type] = prepend ? [listener, existing] :
                                                      [existing, listener];
                } else {
                  // If we've already got an array, just append.
                  if (prepend) {
                    existing.unshift(listener);
                  } else {
                    existing.push(listener);
                  }
                }

                // Check for listener leak
                if (!existing.warned) {
                  m = $getMaxListeners(target);
                  if (m && m > 0 && existing.length > m) {
                    existing.warned = true;
                    var w = new Error('Possible EventEmitter memory leak detected. ' +
                                        existing.length + ' ' + type + ' listeners added. ' +
                                        'Use emitter.setMaxListeners() to increase limit');
                    w.name = 'MaxListenersExceededWarning';
                    w.emitter = target;
                    w.type = type;
                    w.count = existing.length;
                    emitWarning(w);
                  }
                }
              }

              return target;
            }
            function emitWarning(e) {
              typeof console.warn === 'function' ? console.warn(e) : console.log(e);
            }
            EventEmitter.prototype.addListener = function addListener(type, listener) {
              return _addListener(this, type, listener, false);
            };

            EventEmitter.prototype.on = EventEmitter.prototype.addListener;

            EventEmitter.prototype.prependListener =
                function prependListener(type, listener) {
                  return _addListener(this, type, listener, true);
                };

            function _onceWrap(target, type, listener) {
              var fired = false;
              function g() {
                target.removeListener(type, g);
                if (!fired) {
                  fired = true;
                  listener.apply(target, arguments);
                }
              }
              g.listener = listener;
              return g;
            }

            EventEmitter.prototype.once = function once(type, listener) {
              if (typeof listener !== 'function')
                throw new TypeError('"listener" argument must be a function');
              this.on(type, _onceWrap(this, type, listener));
              return this;
            };

            EventEmitter.prototype.prependOnceListener =
                function prependOnceListener(type, listener) {
                  if (typeof listener !== 'function')
                    throw new TypeError('"listener" argument must be a function');
                  this.prependListener(type, _onceWrap(this, type, listener));
                  return this;
                };

            // emits a 'removeListener' event iff the listener was removed
            EventEmitter.prototype.removeListener =
                function removeListener(type, listener) {
                  var list, events, position, i, originalListener;

                  if (typeof listener !== 'function')
                    throw new TypeError('"listener" argument must be a function');

                  events = this._events;
                  if (!events)
                    return this;

                  list = events[type];
                  if (!list)
                    return this;

                  if (list === listener || (list.listener && list.listener === listener)) {
                    if (--this._eventsCount === 0)
                      this._events = new EventHandlers();
                    else {
                      delete events[type];
                      if (events.removeListener)
                        this.emit('removeListener', type, list.listener || listener);
                    }
                  } else if (typeof list !== 'function') {
                    position = -1;

                    for (i = list.length; i-- > 0;) {
                      if (list[i] === listener ||
                          (list[i].listener && list[i].listener === listener)) {
                        originalListener = list[i].listener;
                        position = i;
                        break;
                      }
                    }

                    if (position < 0)
                      return this;

                    if (list.length === 1) {
                      list[0] = undefined;
                      if (--this._eventsCount === 0) {
                        this._events = new EventHandlers();
                        return this;
                      } else {
                        delete events[type];
                      }
                    } else {
                      spliceOne(list, position);
                    }

                    if (events.removeListener)
                      this.emit('removeListener', type, originalListener || listener);
                  }

                  return this;
                };

            EventEmitter.prototype.removeAllListeners =
                function removeAllListeners(type) {
                  var listeners, events;

                  events = this._events;
                  if (!events)
                    return this;

                  // not listening for removeListener, no need to emit
                  if (!events.removeListener) {
                    if (arguments.length === 0) {
                      this._events = new EventHandlers();
                      this._eventsCount = 0;
                    } else if (events[type]) {
                      if (--this._eventsCount === 0)
                        this._events = new EventHandlers();
                      else
                        delete events[type];
                    }
                    return this;
                  }

                  // emit removeListener for all listeners on all events
                  if (arguments.length === 0) {
                    var keys = Object.keys(events);
                    for (var i = 0, key; i < keys.length; ++i) {
                      key = keys[i];
                      if (key === 'removeListener') continue;
                      this.removeAllListeners(key);
                    }
                    this.removeAllListeners('removeListener');
                    this._events = new EventHandlers();
                    this._eventsCount = 0;
                    return this;
                  }

                  listeners = events[type];

                  if (typeof listeners === 'function') {
                    this.removeListener(type, listeners);
                  } else if (listeners) {
                    // LIFO order
                    do {
                      this.removeListener(type, listeners[listeners.length - 1]);
                    } while (listeners[0]);
                  }

                  return this;
                };

            EventEmitter.prototype.listeners = function listeners(type) {
              var evlistener;
              var ret;
              var events = this._events;

              if (!events)
                ret = [];
              else {
                evlistener = events[type];
                if (!evlistener)
                  ret = [];
                else if (typeof evlistener === 'function')
                  ret = [evlistener.listener || evlistener];
                else
                  ret = unwrapListeners(evlistener);
              }

              return ret;
            };

            EventEmitter.listenerCount = function(emitter, type) {
              if (typeof emitter.listenerCount === 'function') {
                return emitter.listenerCount(type);
              } else {
                return listenerCount.call(emitter, type);
              }
            };

            EventEmitter.prototype.listenerCount = listenerCount;
            function listenerCount(type) {
              var events = this._events;

              if (events) {
                var evlistener = events[type];

                if (typeof evlistener === 'function') {
                  return 1;
                } else if (evlistener) {
                  return evlistener.length;
                }
              }

              return 0;
            }

            EventEmitter.prototype.eventNames = function eventNames() {
              return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
            };

            // About 1.5x faster than the two-arg version of Array#splice().
            function spliceOne(list, index) {
              for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
                list[i] = list[k];
              list.pop();
            }

            function arrayClone(arr, i) {
              var copy = new Array(i);
              while (i--)
                copy[i] = arr[i];
              return copy;
            }

            function unwrapListeners(arr) {
              var ret = new Array(arr.length);
              for (var i = 0; i < ret.length; ++i) {
                ret[i] = arr[i].listener || arr[i];
              }
              return ret;
            }

            var events = /*#__PURE__*/Object.freeze({
                        default: EventEmitter,
                        EventEmitter: EventEmitter
            });

            var inherits;
            if (typeof Object.create === 'function'){
              inherits = function inherits(ctor, superCtor) {
                // implementation from standard node.js 'util' module
                ctor.super_ = superCtor;
                ctor.prototype = Object.create(superCtor.prototype, {
                  constructor: {
                    value: ctor,
                    enumerable: false,
                    writable: true,
                    configurable: true
                  }
                });
              };
            } else {
              inherits = function inherits(ctor, superCtor) {
                ctor.super_ = superCtor;
                var TempCtor = function () {};
                TempCtor.prototype = superCtor.prototype;
                ctor.prototype = new TempCtor();
                ctor.prototype.constructor = ctor;
              };
            }
            var inherits$1 = inherits;

            var formatRegExp = /%[sdj%]/g;
            function format(f) {
              if (!isString(f)) {
                var objects = [];
                for (var i = 0; i < arguments.length; i++) {
                  objects.push(inspect(arguments[i]));
                }
                return objects.join(' ');
              }

              var i = 1;
              var args = arguments;
              var len = args.length;
              var str = String(f).replace(formatRegExp, function(x) {
                if (x === '%%') return '%';
                if (i >= len) return x;
                switch (x) {
                  case '%s': return String(args[i++]);
                  case '%d': return Number(args[i++]);
                  case '%j':
                    try {
                      return JSON.stringify(args[i++]);
                    } catch (_) {
                      return '[Circular]';
                    }
                  default:
                    return x;
                }
              });
              for (var x = args[i]; i < len; x = args[++i]) {
                if (isNull(x) || !isObject(x)) {
                  str += ' ' + x;
                } else {
                  str += ' ' + inspect(x);
                }
              }
              return str;
            }

            // Mark that a method should not be used.
            // Returns a modified function which warns once by default.
            // If --no-deprecation is set, then it is a no-op.
            function deprecate(fn, msg) {
              // Allow for deprecating things in the process of starting up.
              if (isUndefined(global$1.process)) {
                return function() {
                  return deprecate(fn, msg).apply(this, arguments);
                };
              }

              if (process.noDeprecation === true) {
                return fn;
              }

              var warned = false;
              function deprecated() {
                if (!warned) {
                  if (process.throwDeprecation) {
                    throw new Error(msg);
                  } else if (process.traceDeprecation) {
                    console.trace(msg);
                  } else {
                    console.error(msg);
                  }
                  warned = true;
                }
                return fn.apply(this, arguments);
              }

              return deprecated;
            }

            var debugs = {};
            var debugEnviron;
            function debuglog(set) {
              if (isUndefined(debugEnviron))
                debugEnviron = process.env.NODE_DEBUG || '';
              set = set.toUpperCase();
              if (!debugs[set]) {
                if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
                  var pid = 0;
                  debugs[set] = function() {
                    var msg = format.apply(null, arguments);
                    console.error('%s %d: %s', set, pid, msg);
                  };
                } else {
                  debugs[set] = function() {};
                }
              }
              return debugs[set];
            }

            /**
             * Echos the value of a value. Trys to print the value out
             * in the best way possible given the different types.
             *
             * @param {Object} obj The object to print out.
             * @param {Object} opts Optional options object that alters the output.
             */
            /* legacy: obj, showHidden, depth, colors*/
            function inspect(obj, opts) {
              // default options
              var ctx = {
                seen: [],
                stylize: stylizeNoColor
              };
              // legacy...
              if (arguments.length >= 3) ctx.depth = arguments[2];
              if (arguments.length >= 4) ctx.colors = arguments[3];
              if (isBoolean(opts)) {
                // legacy...
                ctx.showHidden = opts;
              } else if (opts) {
                // got an "options" object
                _extend(ctx, opts);
              }
              // set default options
              if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
              if (isUndefined(ctx.depth)) ctx.depth = 2;
              if (isUndefined(ctx.colors)) ctx.colors = false;
              if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
              if (ctx.colors) ctx.stylize = stylizeWithColor;
              return formatValue(ctx, obj, ctx.depth);
            }

            // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
            inspect.colors = {
              'bold' : [1, 22],
              'italic' : [3, 23],
              'underline' : [4, 24],
              'inverse' : [7, 27],
              'white' : [37, 39],
              'grey' : [90, 39],
              'black' : [30, 39],
              'blue' : [34, 39],
              'cyan' : [36, 39],
              'green' : [32, 39],
              'magenta' : [35, 39],
              'red' : [31, 39],
              'yellow' : [33, 39]
            };

            // Don't use 'blue' not visible on cmd.exe
            inspect.styles = {
              'special': 'cyan',
              'number': 'yellow',
              'boolean': 'yellow',
              'undefined': 'grey',
              'null': 'bold',
              'string': 'green',
              'date': 'magenta',
              // "name": intentionally not styling
              'regexp': 'red'
            };


            function stylizeWithColor(str, styleType) {
              var style = inspect.styles[styleType];

              if (style) {
                return '\u001b[' + inspect.colors[style][0] + 'm' + str +
                       '\u001b[' + inspect.colors[style][1] + 'm';
              } else {
                return str;
              }
            }


            function stylizeNoColor(str, styleType) {
              return str;
            }


            function arrayToHash(array) {
              var hash = {};

              array.forEach(function(val, idx) {
                hash[val] = true;
              });

              return hash;
            }


            function formatValue(ctx, value, recurseTimes) {
              // Provide a hook for user-specified inspect functions.
              // Check that value is an object with an inspect function on it
              if (ctx.customInspect &&
                  value &&
                  isFunction(value.inspect) &&
                  // Filter out the util module, it's inspect function is special
                  value.inspect !== inspect &&
                  // Also filter out any prototype objects using the circular check.
                  !(value.constructor && value.constructor.prototype === value)) {
                var ret = value.inspect(recurseTimes, ctx);
                if (!isString(ret)) {
                  ret = formatValue(ctx, ret, recurseTimes);
                }
                return ret;
              }

              // Primitive types cannot have properties
              var primitive = formatPrimitive(ctx, value);
              if (primitive) {
                return primitive;
              }

              // Look up the keys of the object.
              var keys = Object.keys(value);
              var visibleKeys = arrayToHash(keys);

              if (ctx.showHidden) {
                keys = Object.getOwnPropertyNames(value);
              }

              // IE doesn't make error fields non-enumerable
              // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
              if (isError(value)
                  && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
                return formatError(value);
              }

              // Some type of object without properties can be shortcutted.
              if (keys.length === 0) {
                if (isFunction(value)) {
                  var name = value.name ? ': ' + value.name : '';
                  return ctx.stylize('[Function' + name + ']', 'special');
                }
                if (isRegExp(value)) {
                  return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                }
                if (isDate(value)) {
                  return ctx.stylize(Date.prototype.toString.call(value), 'date');
                }
                if (isError(value)) {
                  return formatError(value);
                }
              }

              var base = '', array = false, braces = ['{', '}'];

              // Make Array say that they are Array
              if (isArray$1(value)) {
                array = true;
                braces = ['[', ']'];
              }

              // Make functions say that they are functions
              if (isFunction(value)) {
                var n = value.name ? ': ' + value.name : '';
                base = ' [Function' + n + ']';
              }

              // Make RegExps say that they are RegExps
              if (isRegExp(value)) {
                base = ' ' + RegExp.prototype.toString.call(value);
              }

              // Make dates with properties first say the date
              if (isDate(value)) {
                base = ' ' + Date.prototype.toUTCString.call(value);
              }

              // Make error with message first say the error
              if (isError(value)) {
                base = ' ' + formatError(value);
              }

              if (keys.length === 0 && (!array || value.length == 0)) {
                return braces[0] + base + braces[1];
              }

              if (recurseTimes < 0) {
                if (isRegExp(value)) {
                  return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                } else {
                  return ctx.stylize('[Object]', 'special');
                }
              }

              ctx.seen.push(value);

              var output;
              if (array) {
                output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
              } else {
                output = keys.map(function(key) {
                  return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
                });
              }

              ctx.seen.pop();

              return reduceToSingleString(output, base, braces);
            }


            function formatPrimitive(ctx, value) {
              if (isUndefined(value))
                return ctx.stylize('undefined', 'undefined');
              if (isString(value)) {
                var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                         .replace(/'/g, "\\'")
                                                         .replace(/\\"/g, '"') + '\'';
                return ctx.stylize(simple, 'string');
              }
              if (isNumber(value))
                return ctx.stylize('' + value, 'number');
              if (isBoolean(value))
                return ctx.stylize('' + value, 'boolean');
              // For some reason typeof null is "object", so special case here.
              if (isNull(value))
                return ctx.stylize('null', 'null');
            }


            function formatError(value) {
              return '[' + Error.prototype.toString.call(value) + ']';
            }


            function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
              var output = [];
              for (var i = 0, l = value.length; i < l; ++i) {
                if (hasOwnProperty(value, String(i))) {
                  output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                      String(i), true));
                } else {
                  output.push('');
                }
              }
              keys.forEach(function(key) {
                if (!key.match(/^\d+$/)) {
                  output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                      key, true));
                }
              });
              return output;
            }


            function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
              var name, str, desc;
              desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
              if (desc.get) {
                if (desc.set) {
                  str = ctx.stylize('[Getter/Setter]', 'special');
                } else {
                  str = ctx.stylize('[Getter]', 'special');
                }
              } else {
                if (desc.set) {
                  str = ctx.stylize('[Setter]', 'special');
                }
              }
              if (!hasOwnProperty(visibleKeys, key)) {
                name = '[' + key + ']';
              }
              if (!str) {
                if (ctx.seen.indexOf(desc.value) < 0) {
                  if (isNull(recurseTimes)) {
                    str = formatValue(ctx, desc.value, null);
                  } else {
                    str = formatValue(ctx, desc.value, recurseTimes - 1);
                  }
                  if (str.indexOf('\n') > -1) {
                    if (array) {
                      str = str.split('\n').map(function(line) {
                        return '  ' + line;
                      }).join('\n').substr(2);
                    } else {
                      str = '\n' + str.split('\n').map(function(line) {
                        return '   ' + line;
                      }).join('\n');
                    }
                  }
                } else {
                  str = ctx.stylize('[Circular]', 'special');
                }
              }
              if (isUndefined(name)) {
                if (array && key.match(/^\d+$/)) {
                  return str;
                }
                name = JSON.stringify('' + key);
                if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                  name = name.substr(1, name.length - 2);
                  name = ctx.stylize(name, 'name');
                } else {
                  name = name.replace(/'/g, "\\'")
                             .replace(/\\"/g, '"')
                             .replace(/(^"|"$)/g, "'");
                  name = ctx.stylize(name, 'string');
                }
              }

              return name + ': ' + str;
            }


            function reduceToSingleString(output, base, braces) {
              var length = output.reduce(function(prev, cur) {
                if (cur.indexOf('\n') >= 0) ;
                return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
              }, 0);

              if (length > 60) {
                return braces[0] +
                       (base === '' ? '' : base + '\n ') +
                       ' ' +
                       output.join(',\n  ') +
                       ' ' +
                       braces[1];
              }

              return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
            }


            // NOTE: These type checking functions intentionally don't use `instanceof`
            // because it is fragile and can be easily faked with `Object.create()`.
            function isArray$1(ar) {
              return Array.isArray(ar);
            }

            function isBoolean(arg) {
              return typeof arg === 'boolean';
            }

            function isNull(arg) {
              return arg === null;
            }

            function isNumber(arg) {
              return typeof arg === 'number';
            }

            function isString(arg) {
              return typeof arg === 'string';
            }

            function isUndefined(arg) {
              return arg === void 0;
            }

            function isRegExp(re) {
              return isObject(re) && objectToString(re) === '[object RegExp]';
            }

            function isObject(arg) {
              return typeof arg === 'object' && arg !== null;
            }

            function isDate(d) {
              return isObject(d) && objectToString(d) === '[object Date]';
            }

            function isError(e) {
              return isObject(e) &&
                  (objectToString(e) === '[object Error]' || e instanceof Error);
            }

            function isFunction(arg) {
              return typeof arg === 'function';
            }

            function objectToString(o) {
              return Object.prototype.toString.call(o);
            }

            function _extend(origin, add) {
              // Don't do anything if add isn't an object
              if (!add || !isObject(add)) return origin;

              var keys = Object.keys(add);
              var i = keys.length;
              while (i--) {
                origin[keys[i]] = add[keys[i]];
              }
              return origin;
            }
            function hasOwnProperty(obj, prop) {
              return Object.prototype.hasOwnProperty.call(obj, prop);
            }

            function BufferList() {
              this.head = null;
              this.tail = null;
              this.length = 0;
            }

            BufferList.prototype.push = function (v) {
              var entry = { data: v, next: null };
              if (this.length > 0) this.tail.next = entry;else this.head = entry;
              this.tail = entry;
              ++this.length;
            };

            BufferList.prototype.unshift = function (v) {
              var entry = { data: v, next: this.head };
              if (this.length === 0) this.tail = entry;
              this.head = entry;
              ++this.length;
            };

            BufferList.prototype.shift = function () {
              if (this.length === 0) return;
              var ret = this.head.data;
              if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
              --this.length;
              return ret;
            };

            BufferList.prototype.clear = function () {
              this.head = this.tail = null;
              this.length = 0;
            };

            BufferList.prototype.join = function (s) {
              if (this.length === 0) return '';
              var p = this.head;
              var ret = '' + p.data;
              while (p = p.next) {
                ret += s + p.data;
              }return ret;
            };

            BufferList.prototype.concat = function (n) {
              if (this.length === 0) return Buffer.alloc(0);
              if (this.length === 1) return this.head.data;
              var ret = Buffer.allocUnsafe(n >>> 0);
              var p = this.head;
              var i = 0;
              while (p) {
                p.data.copy(ret, i);
                i += p.data.length;
                p = p.next;
              }
              return ret;
            };

            // Copyright Joyent, Inc. and other Node contributors.
            var isBufferEncoding = Buffer.isEncoding
              || function(encoding) {
                   switch (encoding && encoding.toLowerCase()) {
                     case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
                     default: return false;
                   }
                 };


            function assertEncoding(encoding) {
              if (encoding && !isBufferEncoding(encoding)) {
                throw new Error('Unknown encoding: ' + encoding);
              }
            }

            // StringDecoder provides an interface for efficiently splitting a series of
            // buffers into a series of JS strings without breaking apart multi-byte
            // characters. CESU-8 is handled as part of the UTF-8 encoding.
            //
            // @TODO Handling all encodings inside a single object makes it very difficult
            // to reason about this code, so it should be split up in the future.
            // @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
            // points as used by CESU-8.
            function StringDecoder(encoding) {
              this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
              assertEncoding(encoding);
              switch (this.encoding) {
                case 'utf8':
                  // CESU-8 represents each of Surrogate Pair by 3-bytes
                  this.surrogateSize = 3;
                  break;
                case 'ucs2':
                case 'utf16le':
                  // UTF-16 represents each of Surrogate Pair by 2-bytes
                  this.surrogateSize = 2;
                  this.detectIncompleteChar = utf16DetectIncompleteChar;
                  break;
                case 'base64':
                  // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
                  this.surrogateSize = 3;
                  this.detectIncompleteChar = base64DetectIncompleteChar;
                  break;
                default:
                  this.write = passThroughWrite;
                  return;
              }

              // Enough space to store all bytes of a single character. UTF-8 needs 4
              // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
              this.charBuffer = new Buffer(6);
              // Number of bytes received for the current incomplete multi-byte character.
              this.charReceived = 0;
              // Number of bytes expected for the current incomplete multi-byte character.
              this.charLength = 0;
            }

            // write decodes the given buffer and returns it as JS string that is
            // guaranteed to not contain any partial multi-byte characters. Any partial
            // character found at the end of the buffer is buffered up, and will be
            // returned when calling write again with the remaining bytes.
            //
            // Note: Converting a Buffer containing an orphan surrogate to a String
            // currently works, but converting a String to a Buffer (via `new Buffer`, or
            // Buffer#write) will replace incomplete surrogates with the unicode
            // replacement character. See https://codereview.chromium.org/121173009/ .
            StringDecoder.prototype.write = function(buffer) {
              var charStr = '';
              // if our last write ended with an incomplete multibyte character
              while (this.charLength) {
                // determine how many remaining bytes this buffer has to offer for this char
                var available = (buffer.length >= this.charLength - this.charReceived) ?
                    this.charLength - this.charReceived :
                    buffer.length;

                // add the new bytes to the char buffer
                buffer.copy(this.charBuffer, this.charReceived, 0, available);
                this.charReceived += available;

                if (this.charReceived < this.charLength) {
                  // still not enough chars in this buffer? wait for more ...
                  return '';
                }

                // remove bytes belonging to the current character from the buffer
                buffer = buffer.slice(available, buffer.length);

                // get the character that was split
                charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

                // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
                var charCode = charStr.charCodeAt(charStr.length - 1);
                if (charCode >= 0xD800 && charCode <= 0xDBFF) {
                  this.charLength += this.surrogateSize;
                  charStr = '';
                  continue;
                }
                this.charReceived = this.charLength = 0;

                // if there are no more bytes in this buffer, just emit our char
                if (buffer.length === 0) {
                  return charStr;
                }
                break;
              }

              // determine and set charLength / charReceived
              this.detectIncompleteChar(buffer);

              var end = buffer.length;
              if (this.charLength) {
                // buffer the incomplete character bytes we got
                buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
                end -= this.charReceived;
              }

              charStr += buffer.toString(this.encoding, 0, end);

              var end = charStr.length - 1;
              var charCode = charStr.charCodeAt(end);
              // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
              if (charCode >= 0xD800 && charCode <= 0xDBFF) {
                var size = this.surrogateSize;
                this.charLength += size;
                this.charReceived += size;
                this.charBuffer.copy(this.charBuffer, size, 0, size);
                buffer.copy(this.charBuffer, 0, 0, size);
                return charStr.substring(0, end);
              }

              // or just emit the charStr
              return charStr;
            };

            // detectIncompleteChar determines if there is an incomplete UTF-8 character at
            // the end of the given buffer. If so, it sets this.charLength to the byte
            // length that character, and sets this.charReceived to the number of bytes
            // that are available for this character.
            StringDecoder.prototype.detectIncompleteChar = function(buffer) {
              // determine how many bytes we have to check at the end of this buffer
              var i = (buffer.length >= 3) ? 3 : buffer.length;

              // Figure out if one of the last i bytes of our buffer announces an
              // incomplete char.
              for (; i > 0; i--) {
                var c = buffer[buffer.length - i];

                // See http://en.wikipedia.org/wiki/UTF-8#Description

                // 110XXXXX
                if (i == 1 && c >> 5 == 0x06) {
                  this.charLength = 2;
                  break;
                }

                // 1110XXXX
                if (i <= 2 && c >> 4 == 0x0E) {
                  this.charLength = 3;
                  break;
                }

                // 11110XXX
                if (i <= 3 && c >> 3 == 0x1E) {
                  this.charLength = 4;
                  break;
                }
              }
              this.charReceived = i;
            };

            StringDecoder.prototype.end = function(buffer) {
              var res = '';
              if (buffer && buffer.length)
                res = this.write(buffer);

              if (this.charReceived) {
                var cr = this.charReceived;
                var buf = this.charBuffer;
                var enc = this.encoding;
                res += buf.slice(0, cr).toString(enc);
              }

              return res;
            };

            function passThroughWrite(buffer) {
              return buffer.toString(this.encoding);
            }

            function utf16DetectIncompleteChar(buffer) {
              this.charReceived = buffer.length % 2;
              this.charLength = this.charReceived ? 2 : 0;
            }

            function base64DetectIncompleteChar(buffer) {
              this.charReceived = buffer.length % 3;
              this.charLength = this.charReceived ? 3 : 0;
            }

            var stringDecoder = /*#__PURE__*/Object.freeze({
                        StringDecoder: StringDecoder
            });

            Readable.ReadableState = ReadableState;

            var debug = debuglog('stream');
            inherits$1(Readable, EventEmitter);

            function prependListener(emitter, event, fn) {
              // Sadly this is not cacheable as some libraries bundle their own
              // event emitter implementation with them.
              if (typeof emitter.prependListener === 'function') {
                return emitter.prependListener(event, fn);
              } else {
                // This is a hack to make sure that our error handler is attached before any
                // userland ones.  NEVER DO THIS. This is here only because this code needs
                // to continue to work with older versions of Node.js that do not include
                // the prependListener() method. The goal is to eventually remove this hack.
                if (!emitter._events || !emitter._events[event])
                  emitter.on(event, fn);
                else if (Array.isArray(emitter._events[event]))
                  emitter._events[event].unshift(fn);
                else
                  emitter._events[event] = [fn, emitter._events[event]];
              }
            }
            function listenerCount$1 (emitter, type) {
              return emitter.listeners(type).length;
            }
            function ReadableState(options, stream) {

              options = options || {};

              // object stream flag. Used to make read(n) ignore n and to
              // make all the buffer merging and length checks go away
              this.objectMode = !!options.objectMode;

              if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

              // the point at which it stops calling _read() to fill the buffer
              // Note: 0 is a valid value, means "don't call _read preemptively ever"
              var hwm = options.highWaterMark;
              var defaultHwm = this.objectMode ? 16 : 16 * 1024;
              this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

              // cast to ints.
              this.highWaterMark = ~ ~this.highWaterMark;

              // A linked list is used to store data chunks instead of an array because the
              // linked list can remove elements from the beginning faster than
              // array.shift()
              this.buffer = new BufferList();
              this.length = 0;
              this.pipes = null;
              this.pipesCount = 0;
              this.flowing = null;
              this.ended = false;
              this.endEmitted = false;
              this.reading = false;

              // a flag to be able to tell if the onwrite cb is called immediately,
              // or on a later tick.  We set this to true at first, because any
              // actions that shouldn't happen until "later" should generally also
              // not happen before the first write call.
              this.sync = true;

              // whenever we return null, then we set a flag to say
              // that we're awaiting a 'readable' event emission.
              this.needReadable = false;
              this.emittedReadable = false;
              this.readableListening = false;
              this.resumeScheduled = false;

              // Crypto is kind of old and crusty.  Historically, its default string
              // encoding is 'binary' so we have to make this configurable.
              // Everything else in the universe uses 'utf8', though.
              this.defaultEncoding = options.defaultEncoding || 'utf8';

              // when piping, we only care about 'readable' events that happen
              // after read()ing all the bytes and not getting any pushback.
              this.ranOut = false;

              // the number of writers that are awaiting a drain event in .pipe()s
              this.awaitDrain = 0;

              // if true, a maybeReadMore has been scheduled
              this.readingMore = false;

              this.decoder = null;
              this.encoding = null;
              if (options.encoding) {
                this.decoder = new StringDecoder(options.encoding);
                this.encoding = options.encoding;
              }
            }
            function Readable(options) {

              if (!(this instanceof Readable)) return new Readable(options);

              this._readableState = new ReadableState(options, this);

              // legacy
              this.readable = true;

              if (options && typeof options.read === 'function') this._read = options.read;

              EventEmitter.call(this);
            }

            // Manually shove something into the read() buffer.
            // This returns true if the highWaterMark has not been hit yet,
            // similar to how Writable.write() returns true if you should
            // write() some more.
            Readable.prototype.push = function (chunk, encoding) {
              var state = this._readableState;

              if (!state.objectMode && typeof chunk === 'string') {
                encoding = encoding || state.defaultEncoding;
                if (encoding !== state.encoding) {
                  chunk = Buffer.from(chunk, encoding);
                  encoding = '';
                }
              }

              return readableAddChunk(this, state, chunk, encoding, false);
            };

            // Unshift should *always* be something directly out of read()
            Readable.prototype.unshift = function (chunk) {
              var state = this._readableState;
              return readableAddChunk(this, state, chunk, '', true);
            };

            Readable.prototype.isPaused = function () {
              return this._readableState.flowing === false;
            };

            function readableAddChunk(stream, state, chunk, encoding, addToFront) {
              var er = chunkInvalid(state, chunk);
              if (er) {
                stream.emit('error', er);
              } else if (chunk === null) {
                state.reading = false;
                onEofChunk(stream, state);
              } else if (state.objectMode || chunk && chunk.length > 0) {
                if (state.ended && !addToFront) {
                  var e = new Error('stream.push() after EOF');
                  stream.emit('error', e);
                } else if (state.endEmitted && addToFront) {
                  var _e = new Error('stream.unshift() after end event');
                  stream.emit('error', _e);
                } else {
                  var skipAdd;
                  if (state.decoder && !addToFront && !encoding) {
                    chunk = state.decoder.write(chunk);
                    skipAdd = !state.objectMode && chunk.length === 0;
                  }

                  if (!addToFront) state.reading = false;

                  // Don't add to the buffer if we've decoded to an empty string chunk and
                  // we're not in object mode
                  if (!skipAdd) {
                    // if we want the data now, just emit it.
                    if (state.flowing && state.length === 0 && !state.sync) {
                      stream.emit('data', chunk);
                      stream.read(0);
                    } else {
                      // update the buffer info.
                      state.length += state.objectMode ? 1 : chunk.length;
                      if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

                      if (state.needReadable) emitReadable(stream);
                    }
                  }

                  maybeReadMore(stream, state);
                }
              } else if (!addToFront) {
                state.reading = false;
              }

              return needMoreData(state);
            }

            // if it's past the high water mark, we can push in some more.
            // Also, if we have no data yet, we can stand some
            // more bytes.  This is to work around cases where hwm=0,
            // such as the repl.  Also, if the push() triggered a
            // readable event, and the user called read(largeNumber) such that
            // needReadable was set, then we ought to push more, so that another
            // 'readable' event will be triggered.
            function needMoreData(state) {
              return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
            }

            // backwards compatibility.
            Readable.prototype.setEncoding = function (enc) {
              this._readableState.decoder = new StringDecoder(enc);
              this._readableState.encoding = enc;
              return this;
            };

            // Don't raise the hwm > 8MB
            var MAX_HWM = 0x800000;
            function computeNewHighWaterMark(n) {
              if (n >= MAX_HWM) {
                n = MAX_HWM;
              } else {
                // Get the next highest power of 2 to prevent increasing hwm excessively in
                // tiny amounts
                n--;
                n |= n >>> 1;
                n |= n >>> 2;
                n |= n >>> 4;
                n |= n >>> 8;
                n |= n >>> 16;
                n++;
              }
              return n;
            }

            // This function is designed to be inlinable, so please take care when making
            // changes to the function body.
            function howMuchToRead(n, state) {
              if (n <= 0 || state.length === 0 && state.ended) return 0;
              if (state.objectMode) return 1;
              if (n !== n) {
                // Only flow one buffer at a time
                if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
              }
              // If we're asking for more than the current hwm, then raise the hwm.
              if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
              if (n <= state.length) return n;
              // Don't have enough
              if (!state.ended) {
                state.needReadable = true;
                return 0;
              }
              return state.length;
            }

            // you can override either this method, or the async _read(n) below.
            Readable.prototype.read = function (n) {
              debug('read', n);
              n = parseInt(n, 10);
              var state = this._readableState;
              var nOrig = n;

              if (n !== 0) state.emittedReadable = false;

              // if we're doing read(0) to trigger a readable event, but we
              // already have a bunch of data in the buffer, then just trigger
              // the 'readable' event and move on.
              if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
                debug('read: emitReadable', state.length, state.ended);
                if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
                return null;
              }

              n = howMuchToRead(n, state);

              // if we've ended, and we're now clear, then finish it up.
              if (n === 0 && state.ended) {
                if (state.length === 0) endReadable(this);
                return null;
              }

              // All the actual chunk generation logic needs to be
              // *below* the call to _read.  The reason is that in certain
              // synthetic stream cases, such as passthrough streams, _read
              // may be a completely synchronous operation which may change
              // the state of the read buffer, providing enough data when
              // before there was *not* enough.
              //
              // So, the steps are:
              // 1. Figure out what the state of things will be after we do
              // a read from the buffer.
              //
              // 2. If that resulting state will trigger a _read, then call _read.
              // Note that this may be asynchronous, or synchronous.  Yes, it is
              // deeply ugly to write APIs this way, but that still doesn't mean
              // that the Readable class should behave improperly, as streams are
              // designed to be sync/async agnostic.
              // Take note if the _read call is sync or async (ie, if the read call
              // has returned yet), so that we know whether or not it's safe to emit
              // 'readable' etc.
              //
              // 3. Actually pull the requested chunks out of the buffer and return.

              // if we need a readable event, then we need to do some reading.
              var doRead = state.needReadable;
              debug('need readable', doRead);

              // if we currently have less than the highWaterMark, then also read some
              if (state.length === 0 || state.length - n < state.highWaterMark) {
                doRead = true;
                debug('length less than watermark', doRead);
              }

              // however, if we've ended, then there's no point, and if we're already
              // reading, then it's unnecessary.
              if (state.ended || state.reading) {
                doRead = false;
                debug('reading or ended', doRead);
              } else if (doRead) {
                debug('do read');
                state.reading = true;
                state.sync = true;
                // if the length is currently zero, then we *need* a readable event.
                if (state.length === 0) state.needReadable = true;
                // call internal read method
                this._read(state.highWaterMark);
                state.sync = false;
                // If _read pushed data synchronously, then `reading` will be false,
                // and we need to re-evaluate how much data we can return to the user.
                if (!state.reading) n = howMuchToRead(nOrig, state);
              }

              var ret;
              if (n > 0) ret = fromList(n, state);else ret = null;

              if (ret === null) {
                state.needReadable = true;
                n = 0;
              } else {
                state.length -= n;
              }

              if (state.length === 0) {
                // If we have nothing in the buffer, then we want to know
                // as soon as we *do* get something into the buffer.
                if (!state.ended) state.needReadable = true;

                // If we tried to read() past the EOF, then emit end on the next tick.
                if (nOrig !== n && state.ended) endReadable(this);
              }

              if (ret !== null) this.emit('data', ret);

              return ret;
            };

            function chunkInvalid(state, chunk) {
              var er = null;
              if (!isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
                er = new TypeError('Invalid non-string/buffer chunk');
              }
              return er;
            }

            function onEofChunk(stream, state) {
              if (state.ended) return;
              if (state.decoder) {
                var chunk = state.decoder.end();
                if (chunk && chunk.length) {
                  state.buffer.push(chunk);
                  state.length += state.objectMode ? 1 : chunk.length;
                }
              }
              state.ended = true;

              // emit 'readable' now to make sure it gets picked up.
              emitReadable(stream);
            }

            // Don't emit readable right away in sync mode, because this can trigger
            // another read() call => stack overflow.  This way, it might trigger
            // a nextTick recursion warning, but that's not so bad.
            function emitReadable(stream) {
              var state = stream._readableState;
              state.needReadable = false;
              if (!state.emittedReadable) {
                debug('emitReadable', state.flowing);
                state.emittedReadable = true;
                if (state.sync) nextTick(emitReadable_, stream);else emitReadable_(stream);
              }
            }

            function emitReadable_(stream) {
              debug('emit readable');
              stream.emit('readable');
              flow(stream);
            }

            // at this point, the user has presumably seen the 'readable' event,
            // and called read() to consume some data.  that may have triggered
            // in turn another _read(n) call, in which case reading = true if
            // it's in progress.
            // However, if we're not ended, or reading, and the length < hwm,
            // then go ahead and try to read some more preemptively.
            function maybeReadMore(stream, state) {
              if (!state.readingMore) {
                state.readingMore = true;
                nextTick(maybeReadMore_, stream, state);
              }
            }

            function maybeReadMore_(stream, state) {
              var len = state.length;
              while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
                debug('maybeReadMore read 0');
                stream.read(0);
                if (len === state.length)
                  // didn't get any data, stop spinning.
                  break;else len = state.length;
              }
              state.readingMore = false;
            }

            // abstract method.  to be overridden in specific implementation classes.
            // call cb(er, data) where data is <= n in length.
            // for virtual (non-string, non-buffer) streams, "length" is somewhat
            // arbitrary, and perhaps not very meaningful.
            Readable.prototype._read = function (n) {
              this.emit('error', new Error('not implemented'));
            };

            Readable.prototype.pipe = function (dest, pipeOpts) {
              var src = this;
              var state = this._readableState;

              switch (state.pipesCount) {
                case 0:
                  state.pipes = dest;
                  break;
                case 1:
                  state.pipes = [state.pipes, dest];
                  break;
                default:
                  state.pipes.push(dest);
                  break;
              }
              state.pipesCount += 1;
              debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

              var doEnd = (!pipeOpts || pipeOpts.end !== false);

              var endFn = doEnd ? onend : cleanup;
              if (state.endEmitted) nextTick(endFn);else src.once('end', endFn);

              dest.on('unpipe', onunpipe);
              function onunpipe(readable) {
                debug('onunpipe');
                if (readable === src) {
                  cleanup();
                }
              }

              function onend() {
                debug('onend');
                dest.end();
              }

              // when the dest drains, it reduces the awaitDrain counter
              // on the source.  This would be more elegant with a .once()
              // handler in flow(), but adding and removing repeatedly is
              // too slow.
              var ondrain = pipeOnDrain(src);
              dest.on('drain', ondrain);

              var cleanedUp = false;
              function cleanup() {
                debug('cleanup');
                // cleanup event handlers once the pipe is broken
                dest.removeListener('close', onclose);
                dest.removeListener('finish', onfinish);
                dest.removeListener('drain', ondrain);
                dest.removeListener('error', onerror);
                dest.removeListener('unpipe', onunpipe);
                src.removeListener('end', onend);
                src.removeListener('end', cleanup);
                src.removeListener('data', ondata);

                cleanedUp = true;

                // if the reader is waiting for a drain event from this
                // specific writer, then it would cause it to never start
                // flowing again.
                // So, if this is awaiting a drain, then we just call it now.
                // If we don't know, then assume that we are waiting for one.
                if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
              }

              // If the user pushes more data while we're writing to dest then we'll end up
              // in ondata again. However, we only want to increase awaitDrain once because
              // dest will only emit one 'drain' event for the multiple writes.
              // => Introduce a guard on increasing awaitDrain.
              var increasedAwaitDrain = false;
              src.on('data', ondata);
              function ondata(chunk) {
                debug('ondata');
                increasedAwaitDrain = false;
                var ret = dest.write(chunk);
                if (false === ret && !increasedAwaitDrain) {
                  // If the user unpiped during `dest.write()`, it is possible
                  // to get stuck in a permanently paused state if that write
                  // also returned false.
                  // => Check whether `dest` is still a piping destination.
                  if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
                    debug('false write response, pause', src._readableState.awaitDrain);
                    src._readableState.awaitDrain++;
                    increasedAwaitDrain = true;
                  }
                  src.pause();
                }
              }

              // if the dest has an error, then stop piping into it.
              // however, don't suppress the throwing behavior for this.
              function onerror(er) {
                debug('onerror', er);
                unpipe();
                dest.removeListener('error', onerror);
                if (listenerCount$1(dest, 'error') === 0) dest.emit('error', er);
              }

              // Make sure our error handler is attached before userland ones.
              prependListener(dest, 'error', onerror);

              // Both close and finish should trigger unpipe, but only once.
              function onclose() {
                dest.removeListener('finish', onfinish);
                unpipe();
              }
              dest.once('close', onclose);
              function onfinish() {
                debug('onfinish');
                dest.removeListener('close', onclose);
                unpipe();
              }
              dest.once('finish', onfinish);

              function unpipe() {
                debug('unpipe');
                src.unpipe(dest);
              }

              // tell the dest that it's being piped to
              dest.emit('pipe', src);

              // start the flow if it hasn't been started already.
              if (!state.flowing) {
                debug('pipe resume');
                src.resume();
              }

              return dest;
            };

            function pipeOnDrain(src) {
              return function () {
                var state = src._readableState;
                debug('pipeOnDrain', state.awaitDrain);
                if (state.awaitDrain) state.awaitDrain--;
                if (state.awaitDrain === 0 && src.listeners('data').length) {
                  state.flowing = true;
                  flow(src);
                }
              };
            }

            Readable.prototype.unpipe = function (dest) {
              var state = this._readableState;

              // if we're not piping anywhere, then do nothing.
              if (state.pipesCount === 0) return this;

              // just one destination.  most common case.
              if (state.pipesCount === 1) {
                // passed in one, but it's not the right one.
                if (dest && dest !== state.pipes) return this;

                if (!dest) dest = state.pipes;

                // got a match.
                state.pipes = null;
                state.pipesCount = 0;
                state.flowing = false;
                if (dest) dest.emit('unpipe', this);
                return this;
              }

              // slow case. multiple pipe destinations.

              if (!dest) {
                // remove all.
                var dests = state.pipes;
                var len = state.pipesCount;
                state.pipes = null;
                state.pipesCount = 0;
                state.flowing = false;

                for (var _i = 0; _i < len; _i++) {
                  dests[_i].emit('unpipe', this);
                }return this;
              }

              // try to find the right one.
              var i = indexOf(state.pipes, dest);
              if (i === -1) return this;

              state.pipes.splice(i, 1);
              state.pipesCount -= 1;
              if (state.pipesCount === 1) state.pipes = state.pipes[0];

              dest.emit('unpipe', this);

              return this;
            };

            // set up data events if they are asked for
            // Ensure readable listeners eventually get something
            Readable.prototype.on = function (ev, fn) {
              var res = EventEmitter.prototype.on.call(this, ev, fn);

              if (ev === 'data') {
                // Start flowing on next tick if stream isn't explicitly paused
                if (this._readableState.flowing !== false) this.resume();
              } else if (ev === 'readable') {
                var state = this._readableState;
                if (!state.endEmitted && !state.readableListening) {
                  state.readableListening = state.needReadable = true;
                  state.emittedReadable = false;
                  if (!state.reading) {
                    nextTick(nReadingNextTick, this);
                  } else if (state.length) {
                    emitReadable(this, state);
                  }
                }
              }

              return res;
            };
            Readable.prototype.addListener = Readable.prototype.on;

            function nReadingNextTick(self) {
              debug('readable nexttick read 0');
              self.read(0);
            }

            // pause() and resume() are remnants of the legacy readable stream API
            // If the user uses them, then switch into old mode.
            Readable.prototype.resume = function () {
              var state = this._readableState;
              if (!state.flowing) {
                debug('resume');
                state.flowing = true;
                resume(this, state);
              }
              return this;
            };

            function resume(stream, state) {
              if (!state.resumeScheduled) {
                state.resumeScheduled = true;
                nextTick(resume_, stream, state);
              }
            }

            function resume_(stream, state) {
              if (!state.reading) {
                debug('resume read 0');
                stream.read(0);
              }

              state.resumeScheduled = false;
              state.awaitDrain = 0;
              stream.emit('resume');
              flow(stream);
              if (state.flowing && !state.reading) stream.read(0);
            }

            Readable.prototype.pause = function () {
              debug('call pause flowing=%j', this._readableState.flowing);
              if (false !== this._readableState.flowing) {
                debug('pause');
                this._readableState.flowing = false;
                this.emit('pause');
              }
              return this;
            };

            function flow(stream) {
              var state = stream._readableState;
              debug('flow', state.flowing);
              while (state.flowing && stream.read() !== null) {}
            }

            // wrap an old-style stream as the async data source.
            // This is *not* part of the readable stream interface.
            // It is an ugly unfortunate mess of history.
            Readable.prototype.wrap = function (stream) {
              var state = this._readableState;
              var paused = false;

              var self = this;
              stream.on('end', function () {
                debug('wrapped end');
                if (state.decoder && !state.ended) {
                  var chunk = state.decoder.end();
                  if (chunk && chunk.length) self.push(chunk);
                }

                self.push(null);
              });

              stream.on('data', function (chunk) {
                debug('wrapped data');
                if (state.decoder) chunk = state.decoder.write(chunk);

                // don't skip over falsy values in objectMode
                if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

                var ret = self.push(chunk);
                if (!ret) {
                  paused = true;
                  stream.pause();
                }
              });

              // proxy all the other methods.
              // important when wrapping filters and duplexes.
              for (var i in stream) {
                if (this[i] === undefined && typeof stream[i] === 'function') {
                  this[i] = function (method) {
                    return function () {
                      return stream[method].apply(stream, arguments);
                    };
                  }(i);
                }
              }

              // proxy certain important events.
              var events = ['error', 'close', 'destroy', 'pause', 'resume'];
              forEach(events, function (ev) {
                stream.on(ev, self.emit.bind(self, ev));
              });

              // when we try to consume some more bytes, simply unpause the
              // underlying stream.
              self._read = function (n) {
                debug('wrapped _read', n);
                if (paused) {
                  paused = false;
                  stream.resume();
                }
              };

              return self;
            };

            // exposed for testing purposes only.
            Readable._fromList = fromList;

            // Pluck off n bytes from an array of buffers.
            // Length is the combined lengths of all the buffers in the list.
            // This function is designed to be inlinable, so please take care when making
            // changes to the function body.
            function fromList(n, state) {
              // nothing buffered
              if (state.length === 0) return null;

              var ret;
              if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
                // read it all, truncate the list
                if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
                state.buffer.clear();
              } else {
                // read part of list
                ret = fromListPartial(n, state.buffer, state.decoder);
              }

              return ret;
            }

            // Extracts only enough buffered data to satisfy the amount requested.
            // This function is designed to be inlinable, so please take care when making
            // changes to the function body.
            function fromListPartial(n, list, hasStrings) {
              var ret;
              if (n < list.head.data.length) {
                // slice is the same for buffers and strings
                ret = list.head.data.slice(0, n);
                list.head.data = list.head.data.slice(n);
              } else if (n === list.head.data.length) {
                // first chunk is a perfect match
                ret = list.shift();
              } else {
                // result spans more than one buffer
                ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
              }
              return ret;
            }

            // Copies a specified amount of characters from the list of buffered data
            // chunks.
            // This function is designed to be inlinable, so please take care when making
            // changes to the function body.
            function copyFromBufferString(n, list) {
              var p = list.head;
              var c = 1;
              var ret = p.data;
              n -= ret.length;
              while (p = p.next) {
                var str = p.data;
                var nb = n > str.length ? str.length : n;
                if (nb === str.length) ret += str;else ret += str.slice(0, n);
                n -= nb;
                if (n === 0) {
                  if (nb === str.length) {
                    ++c;
                    if (p.next) list.head = p.next;else list.head = list.tail = null;
                  } else {
                    list.head = p;
                    p.data = str.slice(nb);
                  }
                  break;
                }
                ++c;
              }
              list.length -= c;
              return ret;
            }

            // Copies a specified amount of bytes from the list of buffered data chunks.
            // This function is designed to be inlinable, so please take care when making
            // changes to the function body.
            function copyFromBuffer(n, list) {
              var ret = Buffer.allocUnsafe(n);
              var p = list.head;
              var c = 1;
              p.data.copy(ret);
              n -= p.data.length;
              while (p = p.next) {
                var buf = p.data;
                var nb = n > buf.length ? buf.length : n;
                buf.copy(ret, ret.length - n, 0, nb);
                n -= nb;
                if (n === 0) {
                  if (nb === buf.length) {
                    ++c;
                    if (p.next) list.head = p.next;else list.head = list.tail = null;
                  } else {
                    list.head = p;
                    p.data = buf.slice(nb);
                  }
                  break;
                }
                ++c;
              }
              list.length -= c;
              return ret;
            }

            function endReadable(stream) {
              var state = stream._readableState;

              // If we get here before consuming all the bytes, then that is a
              // bug in node.  Should never happen.
              if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

              if (!state.endEmitted) {
                state.ended = true;
                nextTick(endReadableNT, state, stream);
              }
            }

            function endReadableNT(state, stream) {
              // Check that we didn't get one last unshift.
              if (!state.endEmitted && state.length === 0) {
                state.endEmitted = true;
                stream.readable = false;
                stream.emit('end');
              }
            }

            function forEach(xs, f) {
              for (var i = 0, l = xs.length; i < l; i++) {
                f(xs[i], i);
              }
            }

            function indexOf(xs, x) {
              for (var i = 0, l = xs.length; i < l; i++) {
                if (xs[i] === x) return i;
              }
              return -1;
            }

            // A bit simpler than readable streams.
            Writable.WritableState = WritableState;
            inherits$1(Writable, EventEmitter);

            function nop() {}

            function WriteReq(chunk, encoding, cb) {
              this.chunk = chunk;
              this.encoding = encoding;
              this.callback = cb;
              this.next = null;
            }

            function WritableState(options, stream) {
              Object.defineProperty(this, 'buffer', {
                get: deprecate(function () {
                  return this.getBuffer();
                }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
              });
              options = options || {};

              // object stream flag to indicate whether or not this stream
              // contains buffers or objects.
              this.objectMode = !!options.objectMode;

              if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

              // the point at which write() starts returning false
              // Note: 0 is a valid value, means that we always return false if
              // the entire buffer is not flushed immediately on write()
              var hwm = options.highWaterMark;
              var defaultHwm = this.objectMode ? 16 : 16 * 1024;
              this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

              // cast to ints.
              this.highWaterMark = ~ ~this.highWaterMark;

              this.needDrain = false;
              // at the start of calling end()
              this.ending = false;
              // when end() has been called, and returned
              this.ended = false;
              // when 'finish' is emitted
              this.finished = false;

              // should we decode strings into buffers before passing to _write?
              // this is here so that some node-core streams can optimize string
              // handling at a lower level.
              var noDecode = options.decodeStrings === false;
              this.decodeStrings = !noDecode;

              // Crypto is kind of old and crusty.  Historically, its default string
              // encoding is 'binary' so we have to make this configurable.
              // Everything else in the universe uses 'utf8', though.
              this.defaultEncoding = options.defaultEncoding || 'utf8';

              // not an actual buffer we keep track of, but a measurement
              // of how much we're waiting to get pushed to some underlying
              // socket or file.
              this.length = 0;

              // a flag to see when we're in the middle of a write.
              this.writing = false;

              // when true all writes will be buffered until .uncork() call
              this.corked = 0;

              // a flag to be able to tell if the onwrite cb is called immediately,
              // or on a later tick.  We set this to true at first, because any
              // actions that shouldn't happen until "later" should generally also
              // not happen before the first write call.
              this.sync = true;

              // a flag to know if we're processing previously buffered items, which
              // may call the _write() callback in the same tick, so that we don't
              // end up in an overlapped onwrite situation.
              this.bufferProcessing = false;

              // the callback that's passed to _write(chunk,cb)
              this.onwrite = function (er) {
                onwrite(stream, er);
              };

              // the callback that the user supplies to write(chunk,encoding,cb)
              this.writecb = null;

              // the amount that is being written when _write is called.
              this.writelen = 0;

              this.bufferedRequest = null;
              this.lastBufferedRequest = null;

              // number of pending user-supplied write callbacks
              // this must be 0 before 'finish' can be emitted
              this.pendingcb = 0;

              // emit prefinish if the only thing we're waiting for is _write cbs
              // This is relevant for synchronous Transform streams
              this.prefinished = false;

              // True if the error was already emitted and should not be thrown again
              this.errorEmitted = false;

              // count buffered requests
              this.bufferedRequestCount = 0;

              // allocate the first CorkedRequest, there is always
              // one allocated and free to use, and we maintain at most two
              this.corkedRequestsFree = new CorkedRequest(this);
            }

            WritableState.prototype.getBuffer = function writableStateGetBuffer() {
              var current = this.bufferedRequest;
              var out = [];
              while (current) {
                out.push(current);
                current = current.next;
              }
              return out;
            };
            function Writable(options) {

              // Writable ctor is applied to Duplexes, though they're not
              // instanceof Writable, they're instanceof Readable.
              if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);

              this._writableState = new WritableState(options, this);

              // legacy.
              this.writable = true;

              if (options) {
                if (typeof options.write === 'function') this._write = options.write;

                if (typeof options.writev === 'function') this._writev = options.writev;
              }

              EventEmitter.call(this);
            }

            // Otherwise people can pipe Writable streams, which is just wrong.
            Writable.prototype.pipe = function () {
              this.emit('error', new Error('Cannot pipe, not readable'));
            };

            function writeAfterEnd(stream, cb) {
              var er = new Error('write after end');
              // TODO: defer error events consistently everywhere, not just the cb
              stream.emit('error', er);
              nextTick(cb, er);
            }

            // If we get something that is not a buffer, string, null, or undefined,
            // and we're not in objectMode, then that's an error.
            // Otherwise stream chunks are all considered to be of length=1, and the
            // watermarks determine how many objects to keep in the buffer, rather than
            // how many bytes or characters.
            function validChunk(stream, state, chunk, cb) {
              var valid = true;
              var er = false;
              // Always throw error if a null is written
              // if we are not in object mode then throw
              // if it is not a buffer, string, or undefined.
              if (chunk === null) {
                er = new TypeError('May not write null values to stream');
              } else if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
                er = new TypeError('Invalid non-string/buffer chunk');
              }
              if (er) {
                stream.emit('error', er);
                nextTick(cb, er);
                valid = false;
              }
              return valid;
            }

            Writable.prototype.write = function (chunk, encoding, cb) {
              var state = this._writableState;
              var ret = false;

              if (typeof encoding === 'function') {
                cb = encoding;
                encoding = null;
              }

              if (Buffer.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

              if (typeof cb !== 'function') cb = nop;

              if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
                state.pendingcb++;
                ret = writeOrBuffer(this, state, chunk, encoding, cb);
              }

              return ret;
            };

            Writable.prototype.cork = function () {
              var state = this._writableState;

              state.corked++;
            };

            Writable.prototype.uncork = function () {
              var state = this._writableState;

              if (state.corked) {
                state.corked--;

                if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
              }
            };

            Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
              // node::ParseEncoding() requires lower case.
              if (typeof encoding === 'string') encoding = encoding.toLowerCase();
              if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
              this._writableState.defaultEncoding = encoding;
              return this;
            };

            function decodeChunk(state, chunk, encoding) {
              if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
                chunk = Buffer.from(chunk, encoding);
              }
              return chunk;
            }

            // if we're already writing something, then just put this
            // in the queue, and wait our turn.  Otherwise, call _write
            // If we return false, then we need a drain event, so set that flag.
            function writeOrBuffer(stream, state, chunk, encoding, cb) {
              chunk = decodeChunk(state, chunk, encoding);

              if (Buffer.isBuffer(chunk)) encoding = 'buffer';
              var len = state.objectMode ? 1 : chunk.length;

              state.length += len;

              var ret = state.length < state.highWaterMark;
              // we must ensure that previous needDrain will not be reset to false.
              if (!ret) state.needDrain = true;

              if (state.writing || state.corked) {
                var last = state.lastBufferedRequest;
                state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
                if (last) {
                  last.next = state.lastBufferedRequest;
                } else {
                  state.bufferedRequest = state.lastBufferedRequest;
                }
                state.bufferedRequestCount += 1;
              } else {
                doWrite(stream, state, false, len, chunk, encoding, cb);
              }

              return ret;
            }

            function doWrite(stream, state, writev, len, chunk, encoding, cb) {
              state.writelen = len;
              state.writecb = cb;
              state.writing = true;
              state.sync = true;
              if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
              state.sync = false;
            }

            function onwriteError(stream, state, sync, er, cb) {
              --state.pendingcb;
              if (sync) nextTick(cb, er);else cb(er);

              stream._writableState.errorEmitted = true;
              stream.emit('error', er);
            }

            function onwriteStateUpdate(state) {
              state.writing = false;
              state.writecb = null;
              state.length -= state.writelen;
              state.writelen = 0;
            }

            function onwrite(stream, er) {
              var state = stream._writableState;
              var sync = state.sync;
              var cb = state.writecb;

              onwriteStateUpdate(state);

              if (er) onwriteError(stream, state, sync, er, cb);else {
                // Check if we're actually ready to finish, but don't emit yet
                var finished = needFinish(state);

                if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
                  clearBuffer(stream, state);
                }

                if (sync) {
                  /*<replacement>*/
                    nextTick(afterWrite, stream, state, finished, cb);
                  /*</replacement>*/
                } else {
                    afterWrite(stream, state, finished, cb);
                  }
              }
            }

            function afterWrite(stream, state, finished, cb) {
              if (!finished) onwriteDrain(stream, state);
              state.pendingcb--;
              cb();
              finishMaybe(stream, state);
            }

            // Must force callback to be called on nextTick, so that we don't
            // emit 'drain' before the write() consumer gets the 'false' return
            // value, and has a chance to attach a 'drain' listener.
            function onwriteDrain(stream, state) {
              if (state.length === 0 && state.needDrain) {
                state.needDrain = false;
                stream.emit('drain');
              }
            }

            // if there's something in the buffer waiting, then process it
            function clearBuffer(stream, state) {
              state.bufferProcessing = true;
              var entry = state.bufferedRequest;

              if (stream._writev && entry && entry.next) {
                // Fast case, write everything using _writev()
                var l = state.bufferedRequestCount;
                var buffer = new Array(l);
                var holder = state.corkedRequestsFree;
                holder.entry = entry;

                var count = 0;
                while (entry) {
                  buffer[count] = entry;
                  entry = entry.next;
                  count += 1;
                }

                doWrite(stream, state, true, state.length, buffer, '', holder.finish);

                // doWrite is almost always async, defer these to save a bit of time
                // as the hot path ends with doWrite
                state.pendingcb++;
                state.lastBufferedRequest = null;
                if (holder.next) {
                  state.corkedRequestsFree = holder.next;
                  holder.next = null;
                } else {
                  state.corkedRequestsFree = new CorkedRequest(state);
                }
              } else {
                // Slow case, write chunks one-by-one
                while (entry) {
                  var chunk = entry.chunk;
                  var encoding = entry.encoding;
                  var cb = entry.callback;
                  var len = state.objectMode ? 1 : chunk.length;

                  doWrite(stream, state, false, len, chunk, encoding, cb);
                  entry = entry.next;
                  // if we didn't call the onwrite immediately, then
                  // it means that we need to wait until it does.
                  // also, that means that the chunk and cb are currently
                  // being processed, so move the buffer counter past them.
                  if (state.writing) {
                    break;
                  }
                }

                if (entry === null) state.lastBufferedRequest = null;
              }

              state.bufferedRequestCount = 0;
              state.bufferedRequest = entry;
              state.bufferProcessing = false;
            }

            Writable.prototype._write = function (chunk, encoding, cb) {
              cb(new Error('not implemented'));
            };

            Writable.prototype._writev = null;

            Writable.prototype.end = function (chunk, encoding, cb) {
              var state = this._writableState;

              if (typeof chunk === 'function') {
                cb = chunk;
                chunk = null;
                encoding = null;
              } else if (typeof encoding === 'function') {
                cb = encoding;
                encoding = null;
              }

              if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

              // .end() fully uncorks
              if (state.corked) {
                state.corked = 1;
                this.uncork();
              }

              // ignore unnecessary end() calls.
              if (!state.ending && !state.finished) endWritable(this, state, cb);
            };

            function needFinish(state) {
              return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
            }

            function prefinish(stream, state) {
              if (!state.prefinished) {
                state.prefinished = true;
                stream.emit('prefinish');
              }
            }

            function finishMaybe(stream, state) {
              var need = needFinish(state);
              if (need) {
                if (state.pendingcb === 0) {
                  prefinish(stream, state);
                  state.finished = true;
                  stream.emit('finish');
                } else {
                  prefinish(stream, state);
                }
              }
              return need;
            }

            function endWritable(stream, state, cb) {
              state.ending = true;
              finishMaybe(stream, state);
              if (cb) {
                if (state.finished) nextTick(cb);else stream.once('finish', cb);
              }
              state.ended = true;
              stream.writable = false;
            }

            // It seems a linked list but it is not
            // there will be only 2 of these for each stream
            function CorkedRequest(state) {
              var _this = this;

              this.next = null;
              this.entry = null;

              this.finish = function (err) {
                var entry = _this.entry;
                _this.entry = null;
                while (entry) {
                  var cb = entry.callback;
                  state.pendingcb--;
                  cb(err);
                  entry = entry.next;
                }
                if (state.corkedRequestsFree) {
                  state.corkedRequestsFree.next = _this;
                } else {
                  state.corkedRequestsFree = _this;
                }
              };
            }

            inherits$1(Duplex, Readable);

            var keys = Object.keys(Writable.prototype);
            for (var v = 0; v < keys.length; v++) {
              var method = keys[v];
              if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
            }
            function Duplex(options) {
              if (!(this instanceof Duplex)) return new Duplex(options);

              Readable.call(this, options);
              Writable.call(this, options);

              if (options && options.readable === false) this.readable = false;

              if (options && options.writable === false) this.writable = false;

              this.allowHalfOpen = true;
              if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

              this.once('end', onend);
            }

            // the no-half-open enforcer
            function onend() {
              // if we allow half-open state, or if the writable side ended,
              // then we're ok.
              if (this.allowHalfOpen || this._writableState.ended) return;

              // no more data can be written.
              // But allow more writes to happen in this tick.
              nextTick(onEndNT, this);
            }

            function onEndNT(self) {
              self.end();
            }

            // a transform stream is a readable/writable stream where you do
            inherits$1(Transform, Duplex);

            function TransformState(stream) {
              this.afterTransform = function (er, data) {
                return afterTransform(stream, er, data);
              };

              this.needTransform = false;
              this.transforming = false;
              this.writecb = null;
              this.writechunk = null;
              this.writeencoding = null;
            }

            function afterTransform(stream, er, data) {
              var ts = stream._transformState;
              ts.transforming = false;

              var cb = ts.writecb;

              if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

              ts.writechunk = null;
              ts.writecb = null;

              if (data !== null && data !== undefined) stream.push(data);

              cb(er);

              var rs = stream._readableState;
              rs.reading = false;
              if (rs.needReadable || rs.length < rs.highWaterMark) {
                stream._read(rs.highWaterMark);
              }
            }
            function Transform(options) {
              if (!(this instanceof Transform)) return new Transform(options);

              Duplex.call(this, options);

              this._transformState = new TransformState(this);

              // when the writable side finishes, then flush out anything remaining.
              var stream = this;

              // start out asking for a readable event once data is transformed.
              this._readableState.needReadable = true;

              // we have implemented the _read method, and done the other things
              // that Readable wants before the first _read call, so unset the
              // sync guard flag.
              this._readableState.sync = false;

              if (options) {
                if (typeof options.transform === 'function') this._transform = options.transform;

                if (typeof options.flush === 'function') this._flush = options.flush;
              }

              this.once('prefinish', function () {
                if (typeof this._flush === 'function') this._flush(function (er) {
                  done(stream, er);
                });else done(stream);
              });
            }

            Transform.prototype.push = function (chunk, encoding) {
              this._transformState.needTransform = false;
              return Duplex.prototype.push.call(this, chunk, encoding);
            };

            // This is the part where you do stuff!
            // override this function in implementation classes.
            // 'chunk' is an input chunk.
            //
            // Call `push(newChunk)` to pass along transformed output
            // to the readable side.  You may call 'push' zero or more times.
            //
            // Call `cb(err)` when you are done with this chunk.  If you pass
            // an error, then that'll put the hurt on the whole operation.  If you
            // never call cb(), then you'll never get another chunk.
            Transform.prototype._transform = function (chunk, encoding, cb) {
              throw new Error('Not implemented');
            };

            Transform.prototype._write = function (chunk, encoding, cb) {
              var ts = this._transformState;
              ts.writecb = cb;
              ts.writechunk = chunk;
              ts.writeencoding = encoding;
              if (!ts.transforming) {
                var rs = this._readableState;
                if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
              }
            };

            // Doesn't matter what the args are here.
            // _transform does all the work.
            // That we got here means that the readable side wants more data.
            Transform.prototype._read = function (n) {
              var ts = this._transformState;

              if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
                ts.transforming = true;
                this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
              } else {
                // mark that we need a transform, so that any data that comes in
                // will get processed, now that we've asked for it.
                ts.needTransform = true;
              }
            };

            function done(stream, er) {
              if (er) return stream.emit('error', er);

              // if there's nothing in the write buffer, then that means
              // that nothing more will ever be provided
              var ws = stream._writableState;
              var ts = stream._transformState;

              if (ws.length) throw new Error('Calling transform done when ws.length != 0');

              if (ts.transforming) throw new Error('Calling transform done when still transforming');

              return stream.push(null);
            }

            inherits$1(PassThrough, Transform);
            function PassThrough(options) {
              if (!(this instanceof PassThrough)) return new PassThrough(options);

              Transform.call(this, options);
            }

            PassThrough.prototype._transform = function (chunk, encoding, cb) {
              cb(null, chunk);
            };

            inherits$1(Stream, EventEmitter);
            Stream.Readable = Readable;
            Stream.Writable = Writable;
            Stream.Duplex = Duplex;
            Stream.Transform = Transform;
            Stream.PassThrough = PassThrough;

            // Backwards-compat with node 0.4.x
            Stream.Stream = Stream;

            // old-style streams.  Note that the pipe method (the only relevant
            // part of this class) is overridden in the Readable class.

            function Stream() {
              EventEmitter.call(this);
            }

            Stream.prototype.pipe = function(dest, options) {
              var source = this;

              function ondata(chunk) {
                if (dest.writable) {
                  if (false === dest.write(chunk) && source.pause) {
                    source.pause();
                  }
                }
              }

              source.on('data', ondata);

              function ondrain() {
                if (source.readable && source.resume) {
                  source.resume();
                }
              }

              dest.on('drain', ondrain);

              // If the 'end' option is not supplied, dest.end() will be called when
              // source gets the 'end' or 'close' events.  Only dest.end() once.
              if (!dest._isStdio && (!options || options.end !== false)) {
                source.on('end', onend);
                source.on('close', onclose);
              }

              var didOnEnd = false;
              function onend() {
                if (didOnEnd) return;
                didOnEnd = true;

                dest.end();
              }


              function onclose() {
                if (didOnEnd) return;
                didOnEnd = true;

                if (typeof dest.destroy === 'function') dest.destroy();
              }

              // don't leave dangling pipes when there are errors.
              function onerror(er) {
                cleanup();
                if (EventEmitter.listenerCount(this, 'error') === 0) {
                  throw er; // Unhandled stream error in pipe.
                }
              }

              source.on('error', onerror);
              dest.on('error', onerror);

              // remove all the event listeners that were added.
              function cleanup() {
                source.removeListener('data', ondata);
                dest.removeListener('drain', ondrain);

                source.removeListener('end', onend);
                source.removeListener('close', onclose);

                source.removeListener('error', onerror);
                dest.removeListener('error', onerror);

                source.removeListener('end', cleanup);
                source.removeListener('close', cleanup);

                dest.removeListener('close', cleanup);
              }

              source.on('end', cleanup);
              source.on('close', cleanup);

              dest.on('close', cleanup);

              dest.emit('pipe', source);

              // Allow for unix-like usage: A.pipe(B).pipe(C)
              return dest;
            };

            var stream = /*#__PURE__*/Object.freeze({
                        default: Stream,
                        Readable: Readable,
                        Writable: Writable,
                        Duplex: Duplex,
                        Transform: Transform,
                        PassThrough: PassThrough,
                        Stream: Stream
            });

            var require$$0 = ( stream && Stream ) || stream;

            var sax$1 = createCommonjsModule(function (module, exports) {
            (function (sax) { // wrapper for non-node envs
              sax.parser = function (strict, opt) { return new SAXParser(strict, opt) };
              sax.SAXParser = SAXParser;
              sax.SAXStream = SAXStream;
              sax.createStream = createStream;

              // When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
              // When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
              // since that's the earliest that a buffer overrun could occur.  This way, checks are
              // as rare as required, but as often as necessary to ensure never crossing this bound.
              // Furthermore, buffers are only tested at most once per write(), so passing a very
              // large string into write() might have undesirable effects, but this is manageable by
              // the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
              // edge case, result in creating at most one complete copy of the string passed in.
              // Set to Infinity to have unlimited buffers.
              sax.MAX_BUFFER_LENGTH = 64 * 1024;

              var buffers = [
                'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
                'procInstName', 'procInstBody', 'entity', 'attribName',
                'attribValue', 'cdata', 'script'
              ];

              sax.EVENTS = [
                'text',
                'processinginstruction',
                'sgmldeclaration',
                'doctype',
                'comment',
                'opentagstart',
                'attribute',
                'opentag',
                'closetag',
                'opencdata',
                'cdata',
                'closecdata',
                'error',
                'end',
                'ready',
                'script',
                'opennamespace',
                'closenamespace'
              ];

              function SAXParser (strict, opt) {
                if (!(this instanceof SAXParser)) {
                  return new SAXParser(strict, opt)
                }

                var parser = this;
                clearBuffers(parser);
                parser.q = parser.c = '';
                parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
                parser.opt = opt || {};
                parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags;
                parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase';
                parser.tags = [];
                parser.closed = parser.closedRoot = parser.sawRoot = false;
                parser.tag = parser.error = null;
                parser.strict = !!strict;
                parser.noscript = !!(strict || parser.opt.noscript);
                parser.state = S.BEGIN;
                parser.strictEntities = parser.opt.strictEntities;
                parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES);
                parser.attribList = [];

                // namespaces form a prototype chain.
                // it always points at the current tag,
                // which protos to its parent tag.
                if (parser.opt.xmlns) {
                  parser.ns = Object.create(rootNS);
                }

                // mostly just for error reporting
                parser.trackPosition = parser.opt.position !== false;
                if (parser.trackPosition) {
                  parser.position = parser.line = parser.column = 0;
                }
                emit(parser, 'onready');
              }

              if (!Object.create) {
                Object.create = function (o) {
                  function F () {}
                  F.prototype = o;
                  var newf = new F();
                  return newf
                };
              }

              if (!Object.keys) {
                Object.keys = function (o) {
                  var a = [];
                  for (var i in o) if (o.hasOwnProperty(i)) a.push(i);
                  return a
                };
              }

              function checkBufferLength (parser) {
                var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10);
                var maxActual = 0;
                for (var i = 0, l = buffers.length; i < l; i++) {
                  var len = parser[buffers[i]].length;
                  if (len > maxAllowed) {
                    // Text/cdata nodes can get big, and since they're buffered,
                    // we can get here under normal conditions.
                    // Avoid issues by emitting the text node now,
                    // so at least it won't get any bigger.
                    switch (buffers[i]) {
                      case 'textNode':
                        closeText(parser);
                        break

                      case 'cdata':
                        emitNode(parser, 'oncdata', parser.cdata);
                        parser.cdata = '';
                        break

                      case 'script':
                        emitNode(parser, 'onscript', parser.script);
                        parser.script = '';
                        break

                      default:
                        error(parser, 'Max buffer length exceeded: ' + buffers[i]);
                    }
                  }
                  maxActual = Math.max(maxActual, len);
                }
                // schedule the next check for the earliest possible buffer overrun.
                var m = sax.MAX_BUFFER_LENGTH - maxActual;
                parser.bufferCheckPosition = m + parser.position;
              }

              function clearBuffers (parser) {
                for (var i = 0, l = buffers.length; i < l; i++) {
                  parser[buffers[i]] = '';
                }
              }

              function flushBuffers (parser) {
                closeText(parser);
                if (parser.cdata !== '') {
                  emitNode(parser, 'oncdata', parser.cdata);
                  parser.cdata = '';
                }
                if (parser.script !== '') {
                  emitNode(parser, 'onscript', parser.script);
                  parser.script = '';
                }
              }

              SAXParser.prototype = {
                end: function () { end(this); },
                write: write,
                resume: function () { this.error = null; return this },
                close: function () { return this.write(null) },
                flush: function () { flushBuffers(this); }
              };

              var Stream;
              try {
                Stream = require$$0.Stream;
              } catch (ex) {
                Stream = function () {};
              }

              var streamWraps = sax.EVENTS.filter(function (ev) {
                return ev !== 'error' && ev !== 'end'
              });

              function createStream (strict, opt) {
                return new SAXStream(strict, opt)
              }

              function SAXStream (strict, opt) {
                if (!(this instanceof SAXStream)) {
                  return new SAXStream(strict, opt)
                }

                Stream.apply(this);

                this._parser = new SAXParser(strict, opt);
                this.writable = true;
                this.readable = true;

                var me = this;

                this._parser.onend = function () {
                  me.emit('end');
                };

                this._parser.onerror = function (er) {
                  me.emit('error', er);

                  // if didn't throw, then means error was handled.
                  // go ahead and clear error, so we can write again.
                  me._parser.error = null;
                };

                this._decoder = null;

                streamWraps.forEach(function (ev) {
                  Object.defineProperty(me, 'on' + ev, {
                    get: function () {
                      return me._parser['on' + ev]
                    },
                    set: function (h) {
                      if (!h) {
                        me.removeAllListeners(ev);
                        me._parser['on' + ev] = h;
                        return h
                      }
                      me.on(ev, h);
                    },
                    enumerable: true,
                    configurable: false
                  });
                });
              }

              SAXStream.prototype = Object.create(Stream.prototype, {
                constructor: {
                  value: SAXStream
                }
              });

              SAXStream.prototype.write = function (data) {
                if (typeof Buffer === 'function' &&
                  typeof isBuffer === 'function' &&
                  isBuffer(data)) {
                  if (!this._decoder) {
                    var SD = stringDecoder.StringDecoder;
                    this._decoder = new SD('utf8');
                  }
                  data = this._decoder.write(data);
                }

                this._parser.write(data.toString());
                this.emit('data', data);
                return true
              };

              SAXStream.prototype.end = function (chunk) {
                if (chunk && chunk.length) {
                  this.write(chunk);
                }
                this._parser.end();
                return true
              };

              SAXStream.prototype.on = function (ev, handler) {
                var me = this;
                if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
                  me._parser['on' + ev] = function () {
                    var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
                    args.splice(0, 0, ev);
                    me.emit.apply(me, args);
                  };
                }

                return Stream.prototype.on.call(me, ev, handler)
              };

              // this really needs to be replaced with character classes.
              // XML allows all manner of ridiculous numbers and digits.
              var CDATA = '[CDATA[';
              var DOCTYPE = 'DOCTYPE';
              var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
              var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/';
              var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE };

              // http://www.w3.org/TR/REC-xml/#NT-NameStartChar
              // This implementation works on strings, a single character at a time
              // as such, it cannot ever support astral-plane characters (10000-EFFFF)
              // without a significant breaking change to either this  parser, or the
              // JavaScript language.  Implementation of an emoji-capable xml parser
              // is left as an exercise for the reader.
              var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;

              var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;

              var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
              var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;

              function isWhitespace (c) {
                return c === ' ' || c === '\n' || c === '\r' || c === '\t'
              }

              function isQuote (c) {
                return c === '"' || c === '\''
              }

              function isAttribEnd (c) {
                return c === '>' || isWhitespace(c)
              }

              function isMatch (regex, c) {
                return regex.test(c)
              }

              function notMatch (regex, c) {
                return !isMatch(regex, c)
              }

              var S = 0;
              sax.STATE = {
                BEGIN: S++, // leading byte order mark or whitespace
                BEGIN_WHITESPACE: S++, // leading whitespace
                TEXT: S++, // general stuff
                TEXT_ENTITY: S++, // &amp and such.
                OPEN_WAKA: S++, // <
                SGML_DECL: S++, // <!BLARG
                SGML_DECL_QUOTED: S++, // <!BLARG foo "bar
                DOCTYPE: S++, // <!DOCTYPE
                DOCTYPE_QUOTED: S++, // <!DOCTYPE "//blah
                DOCTYPE_DTD: S++, // <!DOCTYPE "//blah" [ ...
                DOCTYPE_DTD_QUOTED: S++, // <!DOCTYPE "//blah" [ "foo
                COMMENT_STARTING: S++, // <!-
                COMMENT: S++, // <!--
                COMMENT_ENDING: S++, // <!-- blah -
                COMMENT_ENDED: S++, // <!-- blah --
                CDATA: S++, // <![CDATA[ something
                CDATA_ENDING: S++, // ]
                CDATA_ENDING_2: S++, // ]]
                PROC_INST: S++, // <?hi
                PROC_INST_BODY: S++, // <?hi there
                PROC_INST_ENDING: S++, // <?hi "there" ?
                OPEN_TAG: S++, // <strong
                OPEN_TAG_SLASH: S++, // <strong /
                ATTRIB: S++, // <a
                ATTRIB_NAME: S++, // <a foo
                ATTRIB_NAME_SAW_WHITE: S++, // <a foo _
                ATTRIB_VALUE: S++, // <a foo=
                ATTRIB_VALUE_QUOTED: S++, // <a foo="bar
                ATTRIB_VALUE_CLOSED: S++, // <a foo="bar"
                ATTRIB_VALUE_UNQUOTED: S++, // <a foo=bar
                ATTRIB_VALUE_ENTITY_Q: S++, // <foo bar="&quot;"
                ATTRIB_VALUE_ENTITY_U: S++, // <foo bar=&quot
                CLOSE_TAG: S++, // </a
                CLOSE_TAG_SAW_WHITE: S++, // </a   >
                SCRIPT: S++, // <script> ...
                SCRIPT_ENDING: S++ // <script> ... <
              };

              sax.XML_ENTITIES = {
                'amp': '&',
                'gt': '>',
                'lt': '<',
                'quot': '"',
                'apos': "'"
              };

              sax.ENTITIES = {
                'amp': '&',
                'gt': '>',
                'lt': '<',
                'quot': '"',
                'apos': "'",
                'AElig': 198,
                'Aacute': 193,
                'Acirc': 194,
                'Agrave': 192,
                'Aring': 197,
                'Atilde': 195,
                'Auml': 196,
                'Ccedil': 199,
                'ETH': 208,
                'Eacute': 201,
                'Ecirc': 202,
                'Egrave': 200,
                'Euml': 203,
                'Iacute': 205,
                'Icirc': 206,
                'Igrave': 204,
                'Iuml': 207,
                'Ntilde': 209,
                'Oacute': 211,
                'Ocirc': 212,
                'Ograve': 210,
                'Oslash': 216,
                'Otilde': 213,
                'Ouml': 214,
                'THORN': 222,
                'Uacute': 218,
                'Ucirc': 219,
                'Ugrave': 217,
                'Uuml': 220,
                'Yacute': 221,
                'aacute': 225,
                'acirc': 226,
                'aelig': 230,
                'agrave': 224,
                'aring': 229,
                'atilde': 227,
                'auml': 228,
                'ccedil': 231,
                'eacute': 233,
                'ecirc': 234,
                'egrave': 232,
                'eth': 240,
                'euml': 235,
                'iacute': 237,
                'icirc': 238,
                'igrave': 236,
                'iuml': 239,
                'ntilde': 241,
                'oacute': 243,
                'ocirc': 244,
                'ograve': 242,
                'oslash': 248,
                'otilde': 245,
                'ouml': 246,
                'szlig': 223,
                'thorn': 254,
                'uacute': 250,
                'ucirc': 251,
                'ugrave': 249,
                'uuml': 252,
                'yacute': 253,
                'yuml': 255,
                'copy': 169,
                'reg': 174,
                'nbsp': 160,
                'iexcl': 161,
                'cent': 162,
                'pound': 163,
                'curren': 164,
                'yen': 165,
                'brvbar': 166,
                'sect': 167,
                'uml': 168,
                'ordf': 170,
                'laquo': 171,
                'not': 172,
                'shy': 173,
                'macr': 175,
                'deg': 176,
                'plusmn': 177,
                'sup1': 185,
                'sup2': 178,
                'sup3': 179,
                'acute': 180,
                'micro': 181,
                'para': 182,
                'middot': 183,
                'cedil': 184,
                'ordm': 186,
                'raquo': 187,
                'frac14': 188,
                'frac12': 189,
                'frac34': 190,
                'iquest': 191,
                'times': 215,
                'divide': 247,
                'OElig': 338,
                'oelig': 339,
                'Scaron': 352,
                'scaron': 353,
                'Yuml': 376,
                'fnof': 402,
                'circ': 710,
                'tilde': 732,
                'Alpha': 913,
                'Beta': 914,
                'Gamma': 915,
                'Delta': 916,
                'Epsilon': 917,
                'Zeta': 918,
                'Eta': 919,
                'Theta': 920,
                'Iota': 921,
                'Kappa': 922,
                'Lambda': 923,
                'Mu': 924,
                'Nu': 925,
                'Xi': 926,
                'Omicron': 927,
                'Pi': 928,
                'Rho': 929,
                'Sigma': 931,
                'Tau': 932,
                'Upsilon': 933,
                'Phi': 934,
                'Chi': 935,
                'Psi': 936,
                'Omega': 937,
                'alpha': 945,
                'beta': 946,
                'gamma': 947,
                'delta': 948,
                'epsilon': 949,
                'zeta': 950,
                'eta': 951,
                'theta': 952,
                'iota': 953,
                'kappa': 954,
                'lambda': 955,
                'mu': 956,
                'nu': 957,
                'xi': 958,
                'omicron': 959,
                'pi': 960,
                'rho': 961,
                'sigmaf': 962,
                'sigma': 963,
                'tau': 964,
                'upsilon': 965,
                'phi': 966,
                'chi': 967,
                'psi': 968,
                'omega': 969,
                'thetasym': 977,
                'upsih': 978,
                'piv': 982,
                'ensp': 8194,
                'emsp': 8195,
                'thinsp': 8201,
                'zwnj': 8204,
                'zwj': 8205,
                'lrm': 8206,
                'rlm': 8207,
                'ndash': 8211,
                'mdash': 8212,
                'lsquo': 8216,
                'rsquo': 8217,
                'sbquo': 8218,
                'ldquo': 8220,
                'rdquo': 8221,
                'bdquo': 8222,
                'dagger': 8224,
                'Dagger': 8225,
                'bull': 8226,
                'hellip': 8230,
                'permil': 8240,
                'prime': 8242,
                'Prime': 8243,
                'lsaquo': 8249,
                'rsaquo': 8250,
                'oline': 8254,
                'frasl': 8260,
                'euro': 8364,
                'image': 8465,
                'weierp': 8472,
                'real': 8476,
                'trade': 8482,
                'alefsym': 8501,
                'larr': 8592,
                'uarr': 8593,
                'rarr': 8594,
                'darr': 8595,
                'harr': 8596,
                'crarr': 8629,
                'lArr': 8656,
                'uArr': 8657,
                'rArr': 8658,
                'dArr': 8659,
                'hArr': 8660,
                'forall': 8704,
                'part': 8706,
                'exist': 8707,
                'empty': 8709,
                'nabla': 8711,
                'isin': 8712,
                'notin': 8713,
                'ni': 8715,
                'prod': 8719,
                'sum': 8721,
                'minus': 8722,
                'lowast': 8727,
                'radic': 8730,
                'prop': 8733,
                'infin': 8734,
                'ang': 8736,
                'and': 8743,
                'or': 8744,
                'cap': 8745,
                'cup': 8746,
                'int': 8747,
                'there4': 8756,
                'sim': 8764,
                'cong': 8773,
                'asymp': 8776,
                'ne': 8800,
                'equiv': 8801,
                'le': 8804,
                'ge': 8805,
                'sub': 8834,
                'sup': 8835,
                'nsub': 8836,
                'sube': 8838,
                'supe': 8839,
                'oplus': 8853,
                'otimes': 8855,
                'perp': 8869,
                'sdot': 8901,
                'lceil': 8968,
                'rceil': 8969,
                'lfloor': 8970,
                'rfloor': 8971,
                'lang': 9001,
                'rang': 9002,
                'loz': 9674,
                'spades': 9824,
                'clubs': 9827,
                'hearts': 9829,
                'diams': 9830
              };

              Object.keys(sax.ENTITIES).forEach(function (key) {
                var e = sax.ENTITIES[key];
                var s = typeof e === 'number' ? String.fromCharCode(e) : e;
                sax.ENTITIES[key] = s;
              });

              for (var s in sax.STATE) {
                sax.STATE[sax.STATE[s]] = s;
              }

              // shorthand
              S = sax.STATE;

              function emit (parser, event, data) {
                parser[event] && parser[event](data);
              }

              function emitNode (parser, nodeType, data) {
                if (parser.textNode) closeText(parser);
                emit(parser, nodeType, data);
              }

              function closeText (parser) {
                parser.textNode = textopts(parser.opt, parser.textNode);
                if (parser.textNode) emit(parser, 'ontext', parser.textNode);
                parser.textNode = '';
              }

              function textopts (opt, text) {
                if (opt.trim) text = text.trim();
                if (opt.normalize) text = text.replace(/\s+/g, ' ');
                return text
              }

              function error (parser, er) {
                closeText(parser);
                if (parser.trackPosition) {
                  er += '\nLine: ' + parser.line +
                    '\nColumn: ' + parser.column +
                    '\nChar: ' + parser.c;
                }
                er = new Error(er);
                parser.error = er;
                emit(parser, 'onerror', er);
                return parser
              }

              function end (parser) {
                if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag');
                if ((parser.state !== S.BEGIN) &&
                  (parser.state !== S.BEGIN_WHITESPACE) &&
                  (parser.state !== S.TEXT)) {
                  error(parser, 'Unexpected end');
                }
                closeText(parser);
                parser.c = '';
                parser.closed = true;
                emit(parser, 'onend');
                SAXParser.call(parser, parser.strict, parser.opt);
                return parser
              }

              function strictFail (parser, message) {
                if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
                  throw new Error('bad call to strictFail')
                }
                if (parser.strict) {
                  error(parser, message);
                }
              }

              function newTag (parser) {
                if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]();
                var parent = parser.tags[parser.tags.length - 1] || parser;
                var tag = parser.tag = { name: parser.tagName, attributes: {} };

                // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
                if (parser.opt.xmlns) {
                  tag.ns = parent.ns;
                }
                parser.attribList.length = 0;
                emitNode(parser, 'onopentagstart', tag);
              }

              function qname (name, attribute) {
                var i = name.indexOf(':');
                var qualName = i < 0 ? [ '', name ] : name.split(':');
                var prefix = qualName[0];
                var local = qualName[1];

                // <x "xmlns"="http://foo">
                if (attribute && name === 'xmlns') {
                  prefix = 'xmlns';
                  local = '';
                }

                return { prefix: prefix, local: local }
              }

              function attrib (parser) {
                if (!parser.strict) {
                  parser.attribName = parser.attribName[parser.looseCase]();
                }

                if (parser.attribList.indexOf(parser.attribName) !== -1 ||
                  parser.tag.attributes.hasOwnProperty(parser.attribName)) {
                  parser.attribName = parser.attribValue = '';
                  return
                }

                if (parser.opt.xmlns) {
                  var qn = qname(parser.attribName, true);
                  var prefix = qn.prefix;
                  var local = qn.local;

                  if (prefix === 'xmlns') {
                    // namespace binding attribute. push the binding into scope
                    if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
                      strictFail(parser,
                        'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' +
                        'Actual: ' + parser.attribValue);
                    } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
                      strictFail(parser,
                        'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' +
                        'Actual: ' + parser.attribValue);
                    } else {
                      var tag = parser.tag;
                      var parent = parser.tags[parser.tags.length - 1] || parser;
                      if (tag.ns === parent.ns) {
                        tag.ns = Object.create(parent.ns);
                      }
                      tag.ns[local] = parser.attribValue;
                    }
                  }

                  // defer onattribute events until all attributes have been seen
                  // so any new bindings can take effect. preserve attribute order
                  // so deferred events can be emitted in document order
                  parser.attribList.push([parser.attribName, parser.attribValue]);
                } else {
                  // in non-xmlns mode, we can emit the event right away
                  parser.tag.attributes[parser.attribName] = parser.attribValue;
                  emitNode(parser, 'onattribute', {
                    name: parser.attribName,
                    value: parser.attribValue
                  });
                }

                parser.attribName = parser.attribValue = '';
              }

              function openTag (parser, selfClosing) {
                if (parser.opt.xmlns) {
                  // emit namespace binding events
                  var tag = parser.tag;

                  // add namespace info to tag
                  var qn = qname(parser.tagName);
                  tag.prefix = qn.prefix;
                  tag.local = qn.local;
                  tag.uri = tag.ns[qn.prefix] || '';

                  if (tag.prefix && !tag.uri) {
                    strictFail(parser, 'Unbound namespace prefix: ' +
                      JSON.stringify(parser.tagName));
                    tag.uri = qn.prefix;
                  }

                  var parent = parser.tags[parser.tags.length - 1] || parser;
                  if (tag.ns && parent.ns !== tag.ns) {
                    Object.keys(tag.ns).forEach(function (p) {
                      emitNode(parser, 'onopennamespace', {
                        prefix: p,
                        uri: tag.ns[p]
                      });
                    });
                  }

                  // handle deferred onattribute events
                  // Note: do not apply default ns to attributes:
                  //   http://www.w3.org/TR/REC-xml-names/#defaulting
                  for (var i = 0, l = parser.attribList.length; i < l; i++) {
                    var nv = parser.attribList[i];
                    var name = nv[0];
                    var value = nv[1];
                    var qualName = qname(name, true);
                    var prefix = qualName.prefix;
                    var local = qualName.local;
                    var uri = prefix === '' ? '' : (tag.ns[prefix] || '');
                    var a = {
                      name: name,
                      value: value,
                      prefix: prefix,
                      local: local,
                      uri: uri
                    };

                    // if there's any attributes with an undefined namespace,
                    // then fail on them now.
                    if (prefix && prefix !== 'xmlns' && !uri) {
                      strictFail(parser, 'Unbound namespace prefix: ' +
                        JSON.stringify(prefix));
                      a.uri = prefix;
                    }
                    parser.tag.attributes[name] = a;
                    emitNode(parser, 'onattribute', a);
                  }
                  parser.attribList.length = 0;
                }

                parser.tag.isSelfClosing = !!selfClosing;

                // process the tag
                parser.sawRoot = true;
                parser.tags.push(parser.tag);
                emitNode(parser, 'onopentag', parser.tag);
                if (!selfClosing) {
                  // special case for <script> in non-strict mode.
                  if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
                    parser.state = S.SCRIPT;
                  } else {
                    parser.state = S.TEXT;
                  }
                  parser.tag = null;
                  parser.tagName = '';
                }
                parser.attribName = parser.attribValue = '';
                parser.attribList.length = 0;
              }

              function closeTag (parser) {
                if (!parser.tagName) {
                  strictFail(parser, 'Weird empty close tag.');
                  parser.textNode += '</>';
                  parser.state = S.TEXT;
                  return
                }

                if (parser.script) {
                  if (parser.tagName !== 'script') {
                    parser.script += '</' + parser.tagName + '>';
                    parser.tagName = '';
                    parser.state = S.SCRIPT;
                    return
                  }
                  emitNode(parser, 'onscript', parser.script);
                  parser.script = '';
                }

                // first make sure that the closing tag actually exists.
                // <a><b></c></b></a> will close everything, otherwise.
                var t = parser.tags.length;
                var tagName = parser.tagName;
                if (!parser.strict) {
                  tagName = tagName[parser.looseCase]();
                }
                var closeTo = tagName;
                while (t--) {
                  var close = parser.tags[t];
                  if (close.name !== closeTo) {
                    // fail the first time in strict mode
                    strictFail(parser, 'Unexpected close tag');
                  } else {
                    break
                  }
                }

                // didn't find it.  we already failed for strict, so just abort.
                if (t < 0) {
                  strictFail(parser, 'Unmatched closing tag: ' + parser.tagName);
                  parser.textNode += '</' + parser.tagName + '>';
                  parser.state = S.TEXT;
                  return
                }
                parser.tagName = tagName;
                var s = parser.tags.length;
                while (s-- > t) {
                  var tag = parser.tag = parser.tags.pop();
                  parser.tagName = parser.tag.name;
                  emitNode(parser, 'onclosetag', parser.tagName);

                  var x = {};
                  for (var i in tag.ns) {
                    x[i] = tag.ns[i];
                  }

                  var parent = parser.tags[parser.tags.length - 1] || parser;
                  if (parser.opt.xmlns && tag.ns !== parent.ns) {
                    // remove namespace bindings introduced by tag
                    Object.keys(tag.ns).forEach(function (p) {
                      var n = tag.ns[p];
                      emitNode(parser, 'onclosenamespace', { prefix: p, uri: n });
                    });
                  }
                }
                if (t === 0) parser.closedRoot = true;
                parser.tagName = parser.attribValue = parser.attribName = '';
                parser.attribList.length = 0;
                parser.state = S.TEXT;
              }

              function parseEntity (parser) {
                var entity = parser.entity;
                var entityLC = entity.toLowerCase();
                var num;
                var numStr = '';

                if (parser.ENTITIES[entity]) {
                  return parser.ENTITIES[entity]
                }
                if (parser.ENTITIES[entityLC]) {
                  return parser.ENTITIES[entityLC]
                }
                entity = entityLC;
                if (entity.charAt(0) === '#') {
                  if (entity.charAt(1) === 'x') {
                    entity = entity.slice(2);
                    num = parseInt(entity, 16);
                    numStr = num.toString(16);
                  } else {
                    entity = entity.slice(1);
                    num = parseInt(entity, 10);
                    numStr = num.toString(10);
                  }
                }
                entity = entity.replace(/^0+/, '');
                if (isNaN(num) || numStr.toLowerCase() !== entity) {
                  strictFail(parser, 'Invalid character entity');
                  return '&' + parser.entity + ';'
                }

                return String.fromCodePoint(num)
              }

              function beginWhiteSpace (parser, c) {
                if (c === '<') {
                  parser.state = S.OPEN_WAKA;
                  parser.startTagPosition = parser.position;
                } else if (!isWhitespace(c)) {
                  // have to process this as a text node.
                  // weird, but happens.
                  strictFail(parser, 'Non-whitespace before first tag.');
                  parser.textNode = c;
                  parser.state = S.TEXT;
                }
              }

              function charAt (chunk, i) {
                var result = '';
                if (i < chunk.length) {
                  result = chunk.charAt(i);
                }
                return result
              }

              function write (chunk) {
                var parser = this;
                if (this.error) {
                  throw this.error
                }
                if (parser.closed) {
                  return error(parser,
                    'Cannot write after close. Assign an onready handler.')
                }
                if (chunk === null) {
                  return end(parser)
                }
                if (typeof chunk === 'object') {
                  chunk = chunk.toString();
                }
                var i = 0;
                var c = '';
                while (true) {
                  c = charAt(chunk, i++);
                  parser.c = c;

                  if (!c) {
                    break
                  }

                  if (parser.trackPosition) {
                    parser.position++;
                    if (c === '\n') {
                      parser.line++;
                      parser.column = 0;
                    } else {
                      parser.column++;
                    }
                  }

                  switch (parser.state) {
                    case S.BEGIN:
                      parser.state = S.BEGIN_WHITESPACE;
                      if (c === '\uFEFF') {
                        continue
                      }
                      beginWhiteSpace(parser, c);
                      continue

                    case S.BEGIN_WHITESPACE:
                      beginWhiteSpace(parser, c);
                      continue

                    case S.TEXT:
                      if (parser.sawRoot && !parser.closedRoot) {
                        var starti = i - 1;
                        while (c && c !== '<' && c !== '&') {
                          c = charAt(chunk, i++);
                          if (c && parser.trackPosition) {
                            parser.position++;
                            if (c === '\n') {
                              parser.line++;
                              parser.column = 0;
                            } else {
                              parser.column++;
                            }
                          }
                        }
                        parser.textNode += chunk.substring(starti, i - 1);
                      }
                      if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
                        parser.state = S.OPEN_WAKA;
                        parser.startTagPosition = parser.position;
                      } else {
                        if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
                          strictFail(parser, 'Text data outside of root node.');
                        }
                        if (c === '&') {
                          parser.state = S.TEXT_ENTITY;
                        } else {
                          parser.textNode += c;
                        }
                      }
                      continue

                    case S.SCRIPT:
                      // only non-strict
                      if (c === '<') {
                        parser.state = S.SCRIPT_ENDING;
                      } else {
                        parser.script += c;
                      }
                      continue

                    case S.SCRIPT_ENDING:
                      if (c === '/') {
                        parser.state = S.CLOSE_TAG;
                      } else {
                        parser.script += '<' + c;
                        parser.state = S.SCRIPT;
                      }
                      continue

                    case S.OPEN_WAKA:
                      // either a /, ?, !, or text is coming next.
                      if (c === '!') {
                        parser.state = S.SGML_DECL;
                        parser.sgmlDecl = '';
                      } else if (isWhitespace(c)) ; else if (isMatch(nameStart, c)) {
                        parser.state = S.OPEN_TAG;
                        parser.tagName = c;
                      } else if (c === '/') {
                        parser.state = S.CLOSE_TAG;
                        parser.tagName = '';
                      } else if (c === '?') {
                        parser.state = S.PROC_INST;
                        parser.procInstName = parser.procInstBody = '';
                      } else {
                        strictFail(parser, 'Unencoded <');
                        // if there was some whitespace, then add that in.
                        if (parser.startTagPosition + 1 < parser.position) {
                          var pad = parser.position - parser.startTagPosition;
                          c = new Array(pad).join(' ') + c;
                        }
                        parser.textNode += '<' + c;
                        parser.state = S.TEXT;
                      }
                      continue

                    case S.SGML_DECL:
                      if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
                        emitNode(parser, 'onopencdata');
                        parser.state = S.CDATA;
                        parser.sgmlDecl = '';
                        parser.cdata = '';
                      } else if (parser.sgmlDecl + c === '--') {
                        parser.state = S.COMMENT;
                        parser.comment = '';
                        parser.sgmlDecl = '';
                      } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
                        parser.state = S.DOCTYPE;
                        if (parser.doctype || parser.sawRoot) {
                          strictFail(parser,
                            'Inappropriately located doctype declaration');
                        }
                        parser.doctype = '';
                        parser.sgmlDecl = '';
                      } else if (c === '>') {
                        emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl);
                        parser.sgmlDecl = '';
                        parser.state = S.TEXT;
                      } else if (isQuote(c)) {
                        parser.state = S.SGML_DECL_QUOTED;
                        parser.sgmlDecl += c;
                      } else {
                        parser.sgmlDecl += c;
                      }
                      continue

                    case S.SGML_DECL_QUOTED:
                      if (c === parser.q) {
                        parser.state = S.SGML_DECL;
                        parser.q = '';
                      }
                      parser.sgmlDecl += c;
                      continue

                    case S.DOCTYPE:
                      if (c === '>') {
                        parser.state = S.TEXT;
                        emitNode(parser, 'ondoctype', parser.doctype);
                        parser.doctype = true; // just remember that we saw it.
                      } else {
                        parser.doctype += c;
                        if (c === '[') {
                          parser.state = S.DOCTYPE_DTD;
                        } else if (isQuote(c)) {
                          parser.state = S.DOCTYPE_QUOTED;
                          parser.q = c;
                        }
                      }
                      continue

                    case S.DOCTYPE_QUOTED:
                      parser.doctype += c;
                      if (c === parser.q) {
                        parser.q = '';
                        parser.state = S.DOCTYPE;
                      }
                      continue

                    case S.DOCTYPE_DTD:
                      parser.doctype += c;
                      if (c === ']') {
                        parser.state = S.DOCTYPE;
                      } else if (isQuote(c)) {
                        parser.state = S.DOCTYPE_DTD_QUOTED;
                        parser.q = c;
                      }
                      continue

                    case S.DOCTYPE_DTD_QUOTED:
                      parser.doctype += c;
                      if (c === parser.q) {
                        parser.state = S.DOCTYPE_DTD;
                        parser.q = '';
                      }
                      continue

                    case S.COMMENT:
                      if (c === '-') {
                        parser.state = S.COMMENT_ENDING;
                      } else {
                        parser.comment += c;
                      }
                      continue

                    case S.COMMENT_ENDING:
                      if (c === '-') {
                        parser.state = S.COMMENT_ENDED;
                        parser.comment = textopts(parser.opt, parser.comment);
                        if (parser.comment) {
                          emitNode(parser, 'oncomment', parser.comment);
                        }
                        parser.comment = '';
                      } else {
                        parser.comment += '-' + c;
                        parser.state = S.COMMENT;
                      }
                      continue

                    case S.COMMENT_ENDED:
                      if (c !== '>') {
                        strictFail(parser, 'Malformed comment');
                        // allow <!-- blah -- bloo --> in non-strict mode,
                        // which is a comment of " blah -- bloo "
                        parser.comment += '--' + c;
                        parser.state = S.COMMENT;
                      } else {
                        parser.state = S.TEXT;
                      }
                      continue

                    case S.CDATA:
                      if (c === ']') {
                        parser.state = S.CDATA_ENDING;
                      } else {
                        parser.cdata += c;
                      }
                      continue

                    case S.CDATA_ENDING:
                      if (c === ']') {
                        parser.state = S.CDATA_ENDING_2;
                      } else {
                        parser.cdata += ']' + c;
                        parser.state = S.CDATA;
                      }
                      continue

                    case S.CDATA_ENDING_2:
                      if (c === '>') {
                        if (parser.cdata) {
                          emitNode(parser, 'oncdata', parser.cdata);
                        }
                        emitNode(parser, 'onclosecdata');
                        parser.cdata = '';
                        parser.state = S.TEXT;
                      } else if (c === ']') {
                        parser.cdata += ']';
                      } else {
                        parser.cdata += ']]' + c;
                        parser.state = S.CDATA;
                      }
                      continue

                    case S.PROC_INST:
                      if (c === '?') {
                        parser.state = S.PROC_INST_ENDING;
                      } else if (isWhitespace(c)) {
                        parser.state = S.PROC_INST_BODY;
                      } else {
                        parser.procInstName += c;
                      }
                      continue

                    case S.PROC_INST_BODY:
                      if (!parser.procInstBody && isWhitespace(c)) {
                        continue
                      } else if (c === '?') {
                        parser.state = S.PROC_INST_ENDING;
                      } else {
                        parser.procInstBody += c;
                      }
                      continue

                    case S.PROC_INST_ENDING:
                      if (c === '>') {
                        emitNode(parser, 'onprocessinginstruction', {
                          name: parser.procInstName,
                          body: parser.procInstBody
                        });
                        parser.procInstName = parser.procInstBody = '';
                        parser.state = S.TEXT;
                      } else {
                        parser.procInstBody += '?' + c;
                        parser.state = S.PROC_INST_BODY;
                      }
                      continue

                    case S.OPEN_TAG:
                      if (isMatch(nameBody, c)) {
                        parser.tagName += c;
                      } else {
                        newTag(parser);
                        if (c === '>') {
                          openTag(parser);
                        } else if (c === '/') {
                          parser.state = S.OPEN_TAG_SLASH;
                        } else {
                          if (!isWhitespace(c)) {
                            strictFail(parser, 'Invalid character in tag name');
                          }
                          parser.state = S.ATTRIB;
                        }
                      }
                      continue

                    case S.OPEN_TAG_SLASH:
                      if (c === '>') {
                        openTag(parser, true);
                        closeTag(parser);
                      } else {
                        strictFail(parser, 'Forward-slash in opening tag not followed by >');
                        parser.state = S.ATTRIB;
                      }
                      continue

                    case S.ATTRIB:
                      // haven't read the attribute name yet.
                      if (isWhitespace(c)) {
                        continue
                      } else if (c === '>') {
                        openTag(parser);
                      } else if (c === '/') {
                        parser.state = S.OPEN_TAG_SLASH;
                      } else if (isMatch(nameStart, c)) {
                        parser.attribName = c;
                        parser.attribValue = '';
                        parser.state = S.ATTRIB_NAME;
                      } else {
                        strictFail(parser, 'Invalid attribute name');
                      }
                      continue

                    case S.ATTRIB_NAME:
                      if (c === '=') {
                        parser.state = S.ATTRIB_VALUE;
                      } else if (c === '>') {
                        strictFail(parser, 'Attribute without value');
                        parser.attribValue = parser.attribName;
                        attrib(parser);
                        openTag(parser);
                      } else if (isWhitespace(c)) {
                        parser.state = S.ATTRIB_NAME_SAW_WHITE;
                      } else if (isMatch(nameBody, c)) {
                        parser.attribName += c;
                      } else {
                        strictFail(parser, 'Invalid attribute name');
                      }
                      continue

                    case S.ATTRIB_NAME_SAW_WHITE:
                      if (c === '=') {
                        parser.state = S.ATTRIB_VALUE;
                      } else if (isWhitespace(c)) {
                        continue
                      } else {
                        strictFail(parser, 'Attribute without value');
                        parser.tag.attributes[parser.attribName] = '';
                        parser.attribValue = '';
                        emitNode(parser, 'onattribute', {
                          name: parser.attribName,
                          value: ''
                        });
                        parser.attribName = '';
                        if (c === '>') {
                          openTag(parser);
                        } else if (isMatch(nameStart, c)) {
                          parser.attribName = c;
                          parser.state = S.ATTRIB_NAME;
                        } else {
                          strictFail(parser, 'Invalid attribute name');
                          parser.state = S.ATTRIB;
                        }
                      }
                      continue

                    case S.ATTRIB_VALUE:
                      if (isWhitespace(c)) {
                        continue
                      } else if (isQuote(c)) {
                        parser.q = c;
                        parser.state = S.ATTRIB_VALUE_QUOTED;
                      } else {
                        strictFail(parser, 'Unquoted attribute value');
                        parser.state = S.ATTRIB_VALUE_UNQUOTED;
                        parser.attribValue = c;
                      }
                      continue

                    case S.ATTRIB_VALUE_QUOTED:
                      if (c !== parser.q) {
                        if (c === '&') {
                          parser.state = S.ATTRIB_VALUE_ENTITY_Q;
                        } else {
                          parser.attribValue += c;
                        }
                        continue
                      }
                      attrib(parser);
                      parser.q = '';
                      parser.state = S.ATTRIB_VALUE_CLOSED;
                      continue

                    case S.ATTRIB_VALUE_CLOSED:
                      if (isWhitespace(c)) {
                        parser.state = S.ATTRIB;
                      } else if (c === '>') {
                        openTag(parser);
                      } else if (c === '/') {
                        parser.state = S.OPEN_TAG_SLASH;
                      } else if (isMatch(nameStart, c)) {
                        strictFail(parser, 'No whitespace between attributes');
                        parser.attribName = c;
                        parser.attribValue = '';
                        parser.state = S.ATTRIB_NAME;
                      } else {
                        strictFail(parser, 'Invalid attribute name');
                      }
                      continue

                    case S.ATTRIB_VALUE_UNQUOTED:
                      if (!isAttribEnd(c)) {
                        if (c === '&') {
                          parser.state = S.ATTRIB_VALUE_ENTITY_U;
                        } else {
                          parser.attribValue += c;
                        }
                        continue
                      }
                      attrib(parser);
                      if (c === '>') {
                        openTag(parser);
                      } else {
                        parser.state = S.ATTRIB;
                      }
                      continue

                    case S.CLOSE_TAG:
                      if (!parser.tagName) {
                        if (isWhitespace(c)) {
                          continue
                        } else if (notMatch(nameStart, c)) {
                          if (parser.script) {
                            parser.script += '</' + c;
                            parser.state = S.SCRIPT;
                          } else {
                            strictFail(parser, 'Invalid tagname in closing tag.');
                          }
                        } else {
                          parser.tagName = c;
                        }
                      } else if (c === '>') {
                        closeTag(parser);
                      } else if (isMatch(nameBody, c)) {
                        parser.tagName += c;
                      } else if (parser.script) {
                        parser.script += '</' + parser.tagName;
                        parser.tagName = '';
                        parser.state = S.SCRIPT;
                      } else {
                        if (!isWhitespace(c)) {
                          strictFail(parser, 'Invalid tagname in closing tag');
                        }
                        parser.state = S.CLOSE_TAG_SAW_WHITE;
                      }
                      continue

                    case S.CLOSE_TAG_SAW_WHITE:
                      if (isWhitespace(c)) {
                        continue
                      }
                      if (c === '>') {
                        closeTag(parser);
                      } else {
                        strictFail(parser, 'Invalid characters in closing tag');
                      }
                      continue

                    case S.TEXT_ENTITY:
                    case S.ATTRIB_VALUE_ENTITY_Q:
                    case S.ATTRIB_VALUE_ENTITY_U:
                      var returnState;
                      var buffer;
                      switch (parser.state) {
                        case S.TEXT_ENTITY:
                          returnState = S.TEXT;
                          buffer = 'textNode';
                          break

                        case S.ATTRIB_VALUE_ENTITY_Q:
                          returnState = S.ATTRIB_VALUE_QUOTED;
                          buffer = 'attribValue';
                          break

                        case S.ATTRIB_VALUE_ENTITY_U:
                          returnState = S.ATTRIB_VALUE_UNQUOTED;
                          buffer = 'attribValue';
                          break
                      }

                      if (c === ';') {
                        parser[buffer] += parseEntity(parser);
                        parser.entity = '';
                        parser.state = returnState;
                      } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
                        parser.entity += c;
                      } else {
                        strictFail(parser, 'Invalid character in entity name');
                        parser[buffer] += '&' + parser.entity + c;
                        parser.entity = '';
                        parser.state = returnState;
                      }

                      continue

                    default:
                      throw new Error(parser, 'Unknown state: ' + parser.state)
                  }
                } // while

                if (parser.position >= parser.bufferCheckPosition) {
                  checkBufferLength(parser);
                }
                return parser
              }

              /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
              /* istanbul ignore next */
              if (!String.fromCodePoint) {
                (function () {
                  var stringFromCharCode = String.fromCharCode;
                  var floor = Math.floor;
                  var fromCodePoint = function () {
                    var MAX_SIZE = 0x4000;
                    var codeUnits = [];
                    var highSurrogate;
                    var lowSurrogate;
                    var index = -1;
                    var length = arguments.length;
                    if (!length) {
                      return ''
                    }
                    var result = '';
                    while (++index < length) {
                      var codePoint = Number(arguments[index]);
                      if (
                        !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
                        codePoint < 0 || // not a valid Unicode code point
                        codePoint > 0x10FFFF || // not a valid Unicode code point
                        floor(codePoint) !== codePoint // not an integer
                      ) {
                        throw RangeError('Invalid code point: ' + codePoint)
                      }
                      if (codePoint <= 0xFFFF) { // BMP code point
                        codeUnits.push(codePoint);
                      } else { // Astral code point; split in surrogate halves
                        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                        codePoint -= 0x10000;
                        highSurrogate = (codePoint >> 10) + 0xD800;
                        lowSurrogate = (codePoint % 0x400) + 0xDC00;
                        codeUnits.push(highSurrogate, lowSurrogate);
                      }
                      if (index + 1 === length || codeUnits.length > MAX_SIZE) {
                        result += stringFromCharCode.apply(null, codeUnits);
                        codeUnits.length = 0;
                      }
                    }
                    return result
                  };
                  /* istanbul ignore next */
                  if (Object.defineProperty) {
                    Object.defineProperty(String, 'fromCodePoint', {
                      value: fromCodePoint,
                      configurable: true,
                      writable: true
                    });
                  } else {
                    String.fromCodePoint = fromCodePoint;
                  }
                }());
              }
            })(exports);
            });

            var bom = createCommonjsModule(function (module, exports) {
            // Generated by CoffeeScript 1.12.7
            (function() {
              exports.stripBOM = function(str) {
                if (str[0] === '\uFEFF') {
                  return str.substring(1);
                } else {
                  return str;
                }
              };

            }).call(commonjsGlobal);
            });
            var bom_1 = bom.stripBOM;

            var processors = createCommonjsModule(function (module, exports) {
            // Generated by CoffeeScript 1.12.7
            (function() {
              var prefixMatch;

              prefixMatch = new RegExp(/(?!xmlns)^.*:/);

              exports.normalize = function(str) {
                return str.toLowerCase();
              };

              exports.firstCharLowerCase = function(str) {
                return str.charAt(0).toLowerCase() + str.slice(1);
              };

              exports.stripPrefix = function(str) {
                return str.replace(prefixMatch, '');
              };

              exports.parseNumbers = function(str) {
                if (!isNaN(str)) {
                  str = str % 1 === 0 ? parseInt(str, 10) : parseFloat(str);
                }
                return str;
              };

              exports.parseBooleans = function(str) {
                if (/^(?:true|false)$/i.test(str)) {
                  str = str.toLowerCase() === 'true';
                }
                return str;
              };

            }).call(commonjsGlobal);
            });
            var processors_1 = processors.normalize;
            var processors_2 = processors.firstCharLowerCase;
            var processors_3 = processors.stripPrefix;
            var processors_4 = processors.parseNumbers;
            var processors_5 = processors.parseBooleans;

            /*
            MIT Licence
            Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic Denicola
            https://github.com/YuzuJS/setImmediate/blob/f1ccbfdf09cb93aadf77c4aa749ea554503b9234/LICENSE.txt
            */

            var nextHandle = 1; // Spec says greater than zero
            var tasksByHandle = {};
            var currentlyRunningATask = false;
            var doc = global$1.document;
            var registerImmediate;

            function setImmediate$1(callback) {
              // Callback can either be a function or a string
              if (typeof callback !== "function") {
                callback = new Function("" + callback);
              }
              // Copy function arguments
              var args = new Array(arguments.length - 1);
              for (var i = 0; i < args.length; i++) {
                  args[i] = arguments[i + 1];
              }
              // Store and register the task
              var task = { callback: callback, args: args };
              tasksByHandle[nextHandle] = task;
              registerImmediate(nextHandle);
              return nextHandle++;
            }

            function clearImmediate(handle) {
                delete tasksByHandle[handle];
            }

            function run(task) {
                var callback = task.callback;
                var args = task.args;
                switch (args.length) {
                case 0:
                    callback();
                    break;
                case 1:
                    callback(args[0]);
                    break;
                case 2:
                    callback(args[0], args[1]);
                    break;
                case 3:
                    callback(args[0], args[1], args[2]);
                    break;
                default:
                    callback.apply(undefined, args);
                    break;
                }
            }

            function runIfPresent(handle) {
                // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
                // So if we're currently running a task, we'll need to delay this invocation.
                if (currentlyRunningATask) {
                    // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
                    // "too much recursion" error.
                    setTimeout(runIfPresent, 0, handle);
                } else {
                    var task = tasksByHandle[handle];
                    if (task) {
                        currentlyRunningATask = true;
                        try {
                            run(task);
                        } finally {
                            clearImmediate(handle);
                            currentlyRunningATask = false;
                        }
                    }
                }
            }

            function installNextTickImplementation() {
                registerImmediate = function(handle) {
                    nextTick(function () { runIfPresent(handle); });
                };
            }

            function canUsePostMessage() {
                // The test against `importScripts` prevents this implementation from being installed inside a web worker,
                // where `global.postMessage` means something completely different and can't be used for this purpose.
                if (global$1.postMessage && !global$1.importScripts) {
                    var postMessageIsAsynchronous = true;
                    var oldOnMessage = global$1.onmessage;
                    global$1.onmessage = function() {
                        postMessageIsAsynchronous = false;
                    };
                    global$1.postMessage("", "*");
                    global$1.onmessage = oldOnMessage;
                    return postMessageIsAsynchronous;
                }
            }

            function installPostMessageImplementation() {
                // Installs an event handler on `global` for the `message` event: see
                // * https://developer.mozilla.org/en/DOM/window.postMessage
                // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

                var messagePrefix = "setImmediate$" + Math.random() + "$";
                var onGlobalMessage = function(event) {
                    if (event.source === global$1 &&
                        typeof event.data === "string" &&
                        event.data.indexOf(messagePrefix) === 0) {
                        runIfPresent(+event.data.slice(messagePrefix.length));
                    }
                };

                if (global$1.addEventListener) {
                    global$1.addEventListener("message", onGlobalMessage, false);
                } else {
                    global$1.attachEvent("onmessage", onGlobalMessage);
                }

                registerImmediate = function(handle) {
                    global$1.postMessage(messagePrefix + handle, "*");
                };
            }

            function installMessageChannelImplementation() {
                var channel = new MessageChannel();
                channel.port1.onmessage = function(event) {
                    var handle = event.data;
                    runIfPresent(handle);
                };

                registerImmediate = function(handle) {
                    channel.port2.postMessage(handle);
                };
            }

            function installReadyStateChangeImplementation() {
                var html = doc.documentElement;
                registerImmediate = function(handle) {
                    // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
                    // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
                    var script = doc.createElement("script");
                    script.onreadystatechange = function () {
                        runIfPresent(handle);
                        script.onreadystatechange = null;
                        html.removeChild(script);
                        script = null;
                    };
                    html.appendChild(script);
                };
            }

            function installSetTimeoutImplementation() {
                registerImmediate = function(handle) {
                    setTimeout(runIfPresent, 0, handle);
                };
            }

            // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
            var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global$1);
            attachTo = attachTo && attachTo.setTimeout ? attachTo : global$1;

            // Don't get fooled by e.g. browserify environments.
            if ({}.toString.call(global$1.process) === "[object process]") {
                // For Node.js before 0.9
                installNextTickImplementation();

            } else if (canUsePostMessage()) {
                // For non-IE10 modern browsers
                installPostMessageImplementation();

            } else if (global$1.MessageChannel) {
                // For web workers, where supported
                installMessageChannelImplementation();

            } else if (doc && "onreadystatechange" in doc.createElement("script")) {
                // For IE 6–8
                installReadyStateChangeImplementation();

            } else {
                // For older browsers
                installSetTimeoutImplementation();
            }

            // DOM APIs, for completeness
            var apply = Function.prototype.apply;

            function clearInterval(timeout) {
              if (typeof timeout === 'number' && typeof global$1.clearInterval === 'function') {
                global$1.clearInterval(timeout);
              } else {
                clearFn(timeout);
              }
            }
            function clearTimeout$1(timeout) {
              if (typeof timeout === 'number' && typeof global$1.clearTimeout === 'function') {
                global$1.clearTimeout(timeout);
              } else {
                clearFn(timeout);
              }
            }
            function clearFn(timeout) {
              if (timeout && typeof timeout.close === 'function') {
                timeout.close();
              }
            }
            function setTimeout$1() {
              return new Timeout(apply.call(global$1.setTimeout, window, arguments), clearTimeout$1);
            }
            function setInterval() {
              return new Timeout(apply.call(global$1.setInterval, window, arguments), clearInterval);
            }

            function Timeout(id) {
              this._id = id;
            }
            Timeout.prototype.unref = Timeout.prototype.ref = function() {};
            Timeout.prototype.close = function() {
              clearFn(this._id);
            };

            // Does not start the time, just sets up the members needed.
            function enroll(item, msecs) {
              clearTimeout$1(item._idleTimeoutId);
              item._idleTimeout = msecs;
            }

            function unenroll(item) {
              clearTimeout$1(item._idleTimeoutId);
              item._idleTimeout = -1;
            }
            var _unrefActive = active;
            function active(item) {
              clearTimeout$1(item._idleTimeoutId);

              var msecs = item._idleTimeout;
              if (msecs >= 0) {
                item._idleTimeoutId = setTimeout$1(function onTimeout() {
                  if (item._onTimeout)
                    item._onTimeout();
                }, msecs);
              }
            }

            var timers = {
              setImmediate: setImmediate$1,
              clearImmediate: clearImmediate,
              setTimeout: setTimeout$1,
              clearTimeout: clearTimeout$1,
              setInterval: setInterval,
              clearInterval: clearInterval,
              active: active,
              unenroll: unenroll,
              _unrefActive: _unrefActive,
              enroll: enroll
            };

            var timers$1 = /*#__PURE__*/Object.freeze({
                        setImmediate: setImmediate$1,
                        clearImmediate: clearImmediate,
                        clearInterval: clearInterval,
                        clearTimeout: clearTimeout$1,
                        setTimeout: setTimeout$1,
                        setInterval: setInterval,
                        enroll: enroll,
                        unenroll: unenroll,
                        _unrefActive: _unrefActive,
                        active: active,
                        default: timers
            });

            var defaults = createCommonjsModule(function (module, exports) {
            // Generated by CoffeeScript 1.12.7
            (function() {
              exports.defaults = {
                "0.1": {
                  explicitCharkey: false,
                  trim: true,
                  normalize: true,
                  normalizeTags: false,
                  attrkey: "@",
                  charkey: "#",
                  explicitArray: false,
                  ignoreAttrs: false,
                  mergeAttrs: false,
                  explicitRoot: false,
                  validator: null,
                  xmlns: false,
                  explicitChildren: false,
                  childkey: '@@',
                  charsAsChildren: false,
                  includeWhiteChars: false,
                  async: false,
                  strict: true,
                  attrNameProcessors: null,
                  attrValueProcessors: null,
                  tagNameProcessors: null,
                  valueProcessors: null,
                  emptyTag: ''
                },
                "0.2": {
                  explicitCharkey: false,
                  trim: false,
                  normalize: false,
                  normalizeTags: false,
                  attrkey: "$",
                  charkey: "_",
                  explicitArray: true,
                  ignoreAttrs: false,
                  mergeAttrs: false,
                  explicitRoot: true,
                  validator: null,
                  xmlns: false,
                  explicitChildren: false,
                  preserveChildrenOrder: false,
                  childkey: '$$',
                  charsAsChildren: false,
                  includeWhiteChars: false,
                  async: false,
                  strict: true,
                  attrNameProcessors: null,
                  attrValueProcessors: null,
                  tagNameProcessors: null,
                  valueProcessors: null,
                  rootName: 'root',
                  xmldec: {
                    'version': '1.0',
                    'encoding': 'UTF-8',
                    'standalone': true
                  },
                  doctype: null,
                  renderOpts: {
                    'pretty': true,
                    'indent': '  ',
                    'newline': '\n'
                  },
                  headless: false,
                  chunkSize: 10000,
                  emptyTag: '',
                  cdata: false
                }
              };

            }).call(commonjsGlobal);
            });
            var defaults_1 = defaults.defaults;

            var require$$1 = ( events && EventEmitter ) || events;

            var require$$4 = ( timers$1 && timers ) || timers$1;

            var parser = createCommonjsModule(function (module, exports) {
            // Generated by CoffeeScript 1.12.7
            (function() {
              var bom$$1, defaults$$1, events, isEmpty, processItem, processors$$1, sax, setImmediate,
                bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
                extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
                hasProp = {}.hasOwnProperty;

              sax = sax$1;

              events = require$$1;

              bom$$1 = bom;

              processors$$1 = processors;

              setImmediate = require$$4.setImmediate;

              defaults$$1 = defaults.defaults;

              isEmpty = function(thing) {
                return typeof thing === "object" && (thing != null) && Object.keys(thing).length === 0;
              };

              processItem = function(processors$$1, item, key) {
                var i, len, process;
                for (i = 0, len = processors$$1.length; i < len; i++) {
                  process = processors$$1[i];
                  item = process(item, key);
                }
                return item;
              };

              exports.Parser = (function(superClass) {
                extend(Parser, superClass);

                function Parser(opts) {
                  this.parseString = bind(this.parseString, this);
                  this.reset = bind(this.reset, this);
                  this.assignOrPush = bind(this.assignOrPush, this);
                  this.processAsync = bind(this.processAsync, this);
                  var key, ref, value;
                  if (!(this instanceof exports.Parser)) {
                    return new exports.Parser(opts);
                  }
                  this.options = {};
                  ref = defaults$$1["0.2"];
                  for (key in ref) {
                    if (!hasProp.call(ref, key)) continue;
                    value = ref[key];
                    this.options[key] = value;
                  }
                  for (key in opts) {
                    if (!hasProp.call(opts, key)) continue;
                    value = opts[key];
                    this.options[key] = value;
                  }
                  if (this.options.xmlns) {
                    this.options.xmlnskey = this.options.attrkey + "ns";
                  }
                  if (this.options.normalizeTags) {
                    if (!this.options.tagNameProcessors) {
                      this.options.tagNameProcessors = [];
                    }
                    this.options.tagNameProcessors.unshift(processors$$1.normalize);
                  }
                  this.reset();
                }

                Parser.prototype.processAsync = function() {
                  var chunk, err;
                  try {
                    if (this.remaining.length <= this.options.chunkSize) {
                      chunk = this.remaining;
                      this.remaining = '';
                      this.saxParser = this.saxParser.write(chunk);
                      return this.saxParser.close();
                    } else {
                      chunk = this.remaining.substr(0, this.options.chunkSize);
                      this.remaining = this.remaining.substr(this.options.chunkSize, this.remaining.length);
                      this.saxParser = this.saxParser.write(chunk);
                      return setImmediate(this.processAsync);
                    }
                  } catch (error1) {
                    err = error1;
                    if (!this.saxParser.errThrown) {
                      this.saxParser.errThrown = true;
                      return this.emit(err);
                    }
                  }
                };

                Parser.prototype.assignOrPush = function(obj, key, newValue) {
                  if (!(key in obj)) {
                    if (!this.options.explicitArray) {
                      return obj[key] = newValue;
                    } else {
                      return obj[key] = [newValue];
                    }
                  } else {
                    if (!(obj[key] instanceof Array)) {
                      obj[key] = [obj[key]];
                    }
                    return obj[key].push(newValue);
                  }
                };

                Parser.prototype.reset = function() {
                  var attrkey, charkey, ontext, stack;
                  this.removeAllListeners();
                  this.saxParser = sax.parser(this.options.strict, {
                    trim: false,
                    normalize: false,
                    xmlns: this.options.xmlns
                  });
                  this.saxParser.errThrown = false;
                  this.saxParser.onerror = (function(_this) {
                    return function(error) {
                      _this.saxParser.resume();
                      if (!_this.saxParser.errThrown) {
                        _this.saxParser.errThrown = true;
                        return _this.emit("error", error);
                      }
                    };
                  })(this);
                  this.saxParser.onend = (function(_this) {
                    return function() {
                      if (!_this.saxParser.ended) {
                        _this.saxParser.ended = true;
                        return _this.emit("end", _this.resultObject);
                      }
                    };
                  })(this);
                  this.saxParser.ended = false;
                  this.EXPLICIT_CHARKEY = this.options.explicitCharkey;
                  this.resultObject = null;
                  stack = [];
                  attrkey = this.options.attrkey;
                  charkey = this.options.charkey;
                  this.saxParser.onopentag = (function(_this) {
                    return function(node) {
                      var key, newValue, obj, processedKey, ref;
                      obj = {};
                      obj[charkey] = "";
                      if (!_this.options.ignoreAttrs) {
                        ref = node.attributes;
                        for (key in ref) {
                          if (!hasProp.call(ref, key)) continue;
                          if (!(attrkey in obj) && !_this.options.mergeAttrs) {
                            obj[attrkey] = {};
                          }
                          newValue = _this.options.attrValueProcessors ? processItem(_this.options.attrValueProcessors, node.attributes[key], key) : node.attributes[key];
                          processedKey = _this.options.attrNameProcessors ? processItem(_this.options.attrNameProcessors, key) : key;
                          if (_this.options.mergeAttrs) {
                            _this.assignOrPush(obj, processedKey, newValue);
                          } else {
                            obj[attrkey][processedKey] = newValue;
                          }
                        }
                      }
                      obj["#name"] = _this.options.tagNameProcessors ? processItem(_this.options.tagNameProcessors, node.name) : node.name;
                      if (_this.options.xmlns) {
                        obj[_this.options.xmlnskey] = {
                          uri: node.uri,
                          local: node.local
                        };
                      }
                      return stack.push(obj);
                    };
                  })(this);
                  this.saxParser.onclosetag = (function(_this) {
                    return function() {
                      var cdata, emptyStr, key, node, nodeName, obj, objClone, old, s, xpath;
                      obj = stack.pop();
                      nodeName = obj["#name"];
                      if (!_this.options.explicitChildren || !_this.options.preserveChildrenOrder) {
                        delete obj["#name"];
                      }
                      if (obj.cdata === true) {
                        cdata = obj.cdata;
                        delete obj.cdata;
                      }
                      s = stack[stack.length - 1];
                      if (obj[charkey].match(/^\s*$/) && !cdata) {
                        emptyStr = obj[charkey];
                        delete obj[charkey];
                      } else {
                        if (_this.options.trim) {
                          obj[charkey] = obj[charkey].trim();
                        }
                        if (_this.options.normalize) {
                          obj[charkey] = obj[charkey].replace(/\s{2,}/g, " ").trim();
                        }
                        obj[charkey] = _this.options.valueProcessors ? processItem(_this.options.valueProcessors, obj[charkey], nodeName) : obj[charkey];
                        if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
                          obj = obj[charkey];
                        }
                      }
                      if (isEmpty(obj)) {
                        obj = _this.options.emptyTag !== '' ? _this.options.emptyTag : emptyStr;
                      }
                      if (_this.options.validator != null) {
                        xpath = "/" + ((function() {
                          var i, len, results;
                          results = [];
                          for (i = 0, len = stack.length; i < len; i++) {
                            node = stack[i];
                            results.push(node["#name"]);
                          }
                          return results;
                        })()).concat(nodeName).join("/");
                        (function() {
                          var err;
                          try {
                            return obj = _this.options.validator(xpath, s && s[nodeName], obj);
                          } catch (error1) {
                            err = error1;
                            return _this.emit("error", err);
                          }
                        })();
                      }
                      if (_this.options.explicitChildren && !_this.options.mergeAttrs && typeof obj === 'object') {
                        if (!_this.options.preserveChildrenOrder) {
                          node = {};
                          if (_this.options.attrkey in obj) {
                            node[_this.options.attrkey] = obj[_this.options.attrkey];
                            delete obj[_this.options.attrkey];
                          }
                          if (!_this.options.charsAsChildren && _this.options.charkey in obj) {
                            node[_this.options.charkey] = obj[_this.options.charkey];
                            delete obj[_this.options.charkey];
                          }
                          if (Object.getOwnPropertyNames(obj).length > 0) {
                            node[_this.options.childkey] = obj;
                          }
                          obj = node;
                        } else if (s) {
                          s[_this.options.childkey] = s[_this.options.childkey] || [];
                          objClone = {};
                          for (key in obj) {
                            if (!hasProp.call(obj, key)) continue;
                            objClone[key] = obj[key];
                          }
                          s[_this.options.childkey].push(objClone);
                          delete obj["#name"];
                          if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
                            obj = obj[charkey];
                          }
                        }
                      }
                      if (stack.length > 0) {
                        return _this.assignOrPush(s, nodeName, obj);
                      } else {
                        if (_this.options.explicitRoot) {
                          old = obj;
                          obj = {};
                          obj[nodeName] = old;
                        }
                        _this.resultObject = obj;
                        _this.saxParser.ended = true;
                        return _this.emit("end", _this.resultObject);
                      }
                    };
                  })(this);
                  ontext = (function(_this) {
                    return function(text) {
                      var charChild, s;
                      s = stack[stack.length - 1];
                      if (s) {
                        s[charkey] += text;
                        if (_this.options.explicitChildren && _this.options.preserveChildrenOrder && _this.options.charsAsChildren && (_this.options.includeWhiteChars || text.replace(/\\n/g, '').trim() !== '')) {
                          s[_this.options.childkey] = s[_this.options.childkey] || [];
                          charChild = {
                            '#name': '__text__'
                          };
                          charChild[charkey] = text;
                          if (_this.options.normalize) {
                            charChild[charkey] = charChild[charkey].replace(/\s{2,}/g, " ").trim();
                          }
                          s[_this.options.childkey].push(charChild);
                        }
                        return s;
                      }
                    };
                  })(this);
                  this.saxParser.ontext = ontext;
                  return this.saxParser.oncdata = (function(_this) {
                    return function(text) {
                      var s;
                      s = ontext(text);
                      if (s) {
                        return s.cdata = true;
                      }
                    };
                  })(this);
                };

                Parser.prototype.parseString = function(str, cb) {
                  var err;
                  if ((cb != null) && typeof cb === "function") {
                    this.on("end", function(result) {
                      this.reset();
                      return cb(null, result);
                    });
                    this.on("error", function(err) {
                      this.reset();
                      return cb(err);
                    });
                  }
                  try {
                    str = str.toString();
                    if (str.trim() === '') {
                      this.emit("end", null);
                      return true;
                    }
                    str = bom$$1.stripBOM(str);
                    if (this.options.async) {
                      this.remaining = str;
                      setImmediate(this.processAsync);
                      return this.saxParser;
                    }
                    return this.saxParser.write(str).close();
                  } catch (error1) {
                    err = error1;
                    if (!(this.saxParser.errThrown || this.saxParser.ended)) {
                      this.emit('error', err);
                      return this.saxParser.errThrown = true;
                    } else if (this.saxParser.ended) {
                      throw err;
                    }
                  }
                };

                return Parser;

              })(events.EventEmitter);

              exports.parseString = function(str, a, b) {
                var cb, options, parser;
                if (b != null) {
                  if (typeof b === 'function') {
                    cb = b;
                  }
                  if (typeof a === 'object') {
                    options = a;
                  }
                } else {
                  if (typeof a === 'function') {
                    cb = a;
                  }
                  options = {};
                }
                parser = new exports.Parser(options);
                return parser.parseString(str, cb);
              };

            }).call(commonjsGlobal);
            });
            var parser_1 = parser.Parser;
            var parser_2 = parser.parseString;

            function _readFiletoPromise(path) {
              var promise = bluebird.promisify(require("fs").readFile);
              return promise(path).then(function (d) {
                return d.toString();
              });
            }

            function _XHRtoPromise(url) {
              var xhr = new XMLHttpRequest();
              var promise = new bluebird(function (resolve, reject) {
                xhr.onload = function () {
                  if (xhr.readyState !== 4) return;
                  if (xhr.status === 200) return resolve(xhr.responseText);else return reject(new Error(xhr.statusText));
                };

                xhr.onerror = function () {
                  return reject(new Error(xhr.statusText));
                };
              });
              xhr.open('GET', url);
              xhr.send();
              return promise;
            }

            function openUrl(url, options) {
              var isNode = typeof window === 'undefined';
              options = options || {};
              var loadFn = options.loadFn || (isNode ? _readFiletoPromise : _XHRtoPromise);
              return loadFn(url);
            }

            function openPlist(url, options) {
              return openUrl(url, options).then(function (d) {
                return parse_2(d);
              });
            }

            function openXML(url, options) {
              return openUrl(url, options).then(bluebird.promisify(parser_2));
            }

            function _slicedToArray(arr, i) {
              return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
            }

            function _arrayWithHoles(arr) {
              if (Array.isArray(arr)) return arr;
            }

            function _iterableToArrayLimit(arr, i) {
              var _arr = [];
              var _n = true;
              var _d = false;
              var _e = undefined;

              try {
                for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                  _arr.push(_s.value);

                  if (i && _arr.length === i) break;
                }
              } catch (err) {
                _d = true;
                _e = err;
              } finally {
                try {
                  if (!_n && _i["return"] != null) _i["return"]();
                } finally {
                  if (_d) throw _e;
                }
              }

              return _arr;
            }

            function _nonIterableRest() {
              throw new TypeError("Invalid attempt to destructure non-iterable instance");
            }

            // The Bounding Box object
            function derive(v0, v1, v2, v3, t) {
              return Math.pow(1 - t, 3) * v0 + 3 * Math.pow(1 - t, 2) * t * v1 + 3 * (1 - t) * Math.pow(t, 2) * v2 + Math.pow(t, 3) * v3;
            }
            /**
             * A bounding box is an enclosing box that describes the smallest measure within which all the points lie.
             * It is used to calculate the bounding box of a glyph or text path.
             *
             * On initialization, x1/y1/x2/y2 will be NaN. Check if the bounding box is empty using `isEmpty()`.
             *
             * @exports opentype.BoundingBox
             * @class
             * @constructor
             */


            function BoundingBox() {
              this.x1 = Number.NaN;
              this.y1 = Number.NaN;
              this.x2 = Number.NaN;
              this.y2 = Number.NaN;
            }
            /**
             * Returns true if the bounding box is empty, that is, no points have been added to the box yet.
             */


            BoundingBox.prototype.isEmpty = function () {
              return isNaN(this.x1) || isNaN(this.y1) || isNaN(this.x2) || isNaN(this.y2);
            };
            /**
             * Add the point to the bounding box.
             * The x1/y1/x2/y2 coordinates of the bounding box will now encompass the given point.
             * @param {number} x - The X coordinate of the point.
             * @param {number} y - The Y coordinate of the point.
             */


            BoundingBox.prototype.addPoint = function (x, y) {
              if (typeof x === 'number') {
                if (isNaN(this.x1) || isNaN(this.x2)) {
                  this.x1 = x;
                  this.x2 = x;
                }

                if (x < this.x1) {
                  this.x1 = x;
                }

                if (x > this.x2) {
                  this.x2 = x;
                }
              }

              if (typeof y === 'number') {
                if (isNaN(this.y1) || isNaN(this.y2)) {
                  this.y1 = y;
                  this.y2 = y;
                }

                if (y < this.y1) {
                  this.y1 = y;
                }

                if (y > this.y2) {
                  this.y2 = y;
                }
              }
            };
            /**
             * Add a X coordinate to the bounding box.
             * This extends the bounding box to include the X coordinate.
             * This function is used internally inside of addBezier.
             * @param {number} x - The X coordinate of the point.
             */


            BoundingBox.prototype.addX = function (x) {
              this.addPoint(x, null);
            };
            /**
             * Add a Y coordinate to the bounding box.
             * This extends the bounding box to include the Y coordinate.
             * This function is used internally inside of addBezier.
             * @param {number} y - The Y coordinate of the point.
             */


            BoundingBox.prototype.addY = function (y) {
              this.addPoint(null, y);
            };
            /**
             * Add a Bézier curve to the bounding box.
             * This extends the bounding box to include the entire Bézier.
             * @param {number} x0 - The starting X coordinate.
             * @param {number} y0 - The starting Y coordinate.
             * @param {number} x1 - The X coordinate of the first control point.
             * @param {number} y1 - The Y coordinate of the first control point.
             * @param {number} x2 - The X coordinate of the second control point.
             * @param {number} y2 - The Y coordinate of the second control point.
             * @param {number} x - The ending X coordinate.
             * @param {number} y - The ending Y coordinate.
             */


            BoundingBox.prototype.addBezier = function (x0, y0, x1, y1, x2, y2, x, y) {
              // This code is based on http://nishiohirokazu.blogspot.com/2009/06/how-to-calculate-bezier-curves-bounding.html
              // and https://github.com/icons8/svg-path-bounding-box
              var p0 = [x0, y0];
              var p1 = [x1, y1];
              var p2 = [x2, y2];
              var p3 = [x, y];
              this.addPoint(x0, y0);
              this.addPoint(x, y);

              for (var i = 0; i <= 1; i++) {
                var b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
                var a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
                var c = 3 * p1[i] - 3 * p0[i];

                if (a === 0) {
                  if (b === 0) continue;
                  var t = -c / b;

                  if (0 < t && t < 1) {
                    if (i === 0) this.addX(derive(p0[i], p1[i], p2[i], p3[i], t));
                    if (i === 1) this.addY(derive(p0[i], p1[i], p2[i], p3[i], t));
                  }

                  continue;
                }

                var b2ac = Math.pow(b, 2) - 4 * c * a;
                if (b2ac < 0) continue;
                var t1 = (-b + Math.sqrt(b2ac)) / (2 * a);

                if (0 < t1 && t1 < 1) {
                  if (i === 0) this.addX(derive(p0[i], p1[i], p2[i], p3[i], t1));
                  if (i === 1) this.addY(derive(p0[i], p1[i], p2[i], p3[i], t1));
                }

                var t2 = (-b - Math.sqrt(b2ac)) / (2 * a);

                if (0 < t2 && t2 < 1) {
                  if (i === 0) this.addX(derive(p0[i], p1[i], p2[i], p3[i], t2));
                  if (i === 1) this.addY(derive(p0[i], p1[i], p2[i], p3[i], t2));
                }
              }
            };
            /**
             * Add a quadratic curve to the bounding box.
             * This extends the bounding box to include the entire quadratic curve.
             * @param {number} x0 - The starting X coordinate.
             * @param {number} y0 - The starting Y coordinate.
             * @param {number} x1 - The X coordinate of the control point.
             * @param {number} y1 - The Y coordinate of the control point.
             * @param {number} x - The ending X coordinate.
             * @param {number} y - The ending Y coordinate.
             */


            BoundingBox.prototype.addQuad = function (x0, y0, x1, y1, x, y) {
              var cp1x = x0 + 2 / 3 * (x1 - x0);
              var cp1y = y0 + 2 / 3 * (y1 - y0);
              var cp2x = cp1x + 1 / 3 * (x - x0);
              var cp2y = cp1y + 1 / 3 * (y - y0);
              this.addBezier(x0, y0, cp1x, cp1y, cp2x, cp2y, x, y);
            };

            /**
             * A bézier path containing a set of path commands similar to a SVG path.
             * Paths can be drawn on a context using `draw`.
             * @exports opentype.Path
             * @class
             * @constructor
             */

            function Path() {
              this.commands = [];
              this.fill = 'black';
              this.stroke = null;
              this.strokeWidth = 1;
            }
            /**
             * @param  {number} x
             * @param  {number} y
             */


            Path.prototype.moveTo = function (x, y) {
              this.commands.push({
                type: 'M',
                x: x,
                y: y
              });
            };
            /**
             * @param  {number} x
             * @param  {number} y
             */


            Path.prototype.lineTo = function (x, y) {
              this.commands.push({
                type: 'L',
                x: x,
                y: y
              });
            };
            /**
             * Draws cubic curve
             * @function
             * curveTo
             * @memberof opentype.Path.prototype
             * @param  {number} x1 - x of control 1
             * @param  {number} y1 - y of control 1
             * @param  {number} x2 - x of control 2
             * @param  {number} y2 - y of control 2
             * @param  {number} x - x of path point
             * @param  {number} y - y of path point
             */

            /**
             * Draws cubic curve
             * @function
             * bezierCurveTo
             * @memberof opentype.Path.prototype
             * @param  {number} x1 - x of control 1
             * @param  {number} y1 - y of control 1
             * @param  {number} x2 - x of control 2
             * @param  {number} y2 - y of control 2
             * @param  {number} x - x of path point
             * @param  {number} y - y of path point
             * @see curveTo
             */


            Path.prototype.curveTo = Path.prototype.bezierCurveTo = function (x1, y1, x2, y2, x, y) {
              this.commands.push({
                type: 'C',
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                x: x,
                y: y
              });
            };
            /**
             * Draws quadratic curve
             * @function
             * quadraticCurveTo
             * @memberof opentype.Path.prototype
             * @param  {number} x1 - x of control
             * @param  {number} y1 - y of control
             * @param  {number} x - x of path point
             * @param  {number} y - y of path point
             */

            /**
             * Draws quadratic curve
             * @function
             * quadTo
             * @memberof opentype.Path.prototype
             * @param  {number} x1 - x of control
             * @param  {number} y1 - y of control
             * @param  {number} x - x of path point
             * @param  {number} y - y of path point
             */


            Path.prototype.quadTo = Path.prototype.quadraticCurveTo = function (x1, y1, x, y) {
              this.commands.push({
                type: 'Q',
                x1: x1,
                y1: y1,
                x: x,
                y: y
              });
            };
            /**
             * Closes the path
             * @function closePath
             * @memberof opentype.Path.prototype
             */

            /**
             * Close the path
             * @function close
             * @memberof opentype.Path.prototype
             */


            Path.prototype.close = Path.prototype.closePath = function () {
              this.commands.push({
                type: 'Z'
              });
            };

            function t(x, y, affine) {
              var _affine = _slicedToArray(affine, 6),
                  a = _affine[0],
                  b = _affine[1],
                  c = _affine[2],
                  d = _affine[3],
                  tx = _affine[4],
                  ty = _affine[5];

              return [a * x + c * y + tx, b * x + d * y + ty];
            }

            Path.prototype.transform = function (affine) {
              for (var i = 0; i < this.commands.length; i++) {
                var cmd = this.commands[i];
                console.log(t(cmd.x, cmd.y, affine));

                var _t = t(cmd.x, cmd.y, affine);

                var _t2 = _slicedToArray(_t, 2);

                cmd.x = _t2[0];
                cmd.y = _t2[1];

                if (cmd.x1) {
                  var _t3 = t(cmd.x1, cmd.y1, affine);

                  var _t4 = _slicedToArray(_t3, 2);

                  cmd.x1 = _t4[0];
                  cmd.y1 = _t4[1];
                }

                if (cmd.x2) {
                  var _t5 = t(cmd.x2, cmd.y2, affine);

                  var _t6 = _slicedToArray(_t5, 2);

                  cmd.x2 = _t6[0];
                  cmd.y2 = _t6[1];
                }
              }

              return this;
            };
            /**
             * Add the given path or list of commands to the commands of this path.
             * @param  {Array} pathOrCommands - another opentype.Path, an opentype.BoundingBox, or an array of commands.
             */


            Path.prototype.extend = function (pathOrCommands) {
              if (pathOrCommands.commands) {
                pathOrCommands = pathOrCommands.commands;
              } else if (pathOrCommands instanceof BoundingBox) {
                var box = pathOrCommands;
                this.moveTo(box.x1, box.y1);
                this.lineTo(box.x2, box.y1);
                this.lineTo(box.x2, box.y2);
                this.lineTo(box.x1, box.y2);
                this.close();
                return;
              }

              Array.prototype.push.apply(this.commands, pathOrCommands);
            };
            /**
             * Calculate the bounding box of the path.
             * @returns {opentype.BoundingBox}
             */


            Path.prototype.getBoundingBox = function () {
              var box = new BoundingBox();
              var startX = 0;
              var startY = 0;
              var prevX = 0;
              var prevY = 0;

              for (var i = 0; i < this.commands.length; i++) {
                var cmd = this.commands[i];

                switch (cmd.type) {
                  case 'M':
                    box.addPoint(cmd.x, cmd.y);
                    startX = prevX = cmd.x;
                    startY = prevY = cmd.y;
                    break;

                  case 'L':
                    box.addPoint(cmd.x, cmd.y);
                    prevX = cmd.x;
                    prevY = cmd.y;
                    break;

                  case 'Q':
                    box.addQuad(prevX, prevY, cmd.x1, cmd.y1, cmd.x, cmd.y);
                    prevX = cmd.x;
                    prevY = cmd.y;
                    break;

                  case 'C':
                    box.addBezier(prevX, prevY, cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
                    prevX = cmd.x;
                    prevY = cmd.y;
                    break;

                  case 'Z':
                    prevX = startX;
                    prevY = startY;
                    break;

                  default:
                    throw new Error('Unexpected path command ' + cmd.type);
                }
              }

              if (box.isEmpty()) {
                box.addPoint(0, 0);
              }

              return box;
            };
            /**
             * Draw the path to a 2D context.
             * @param {CanvasRenderingContext2D} ctx - A 2D drawing context.
             */


            Path.prototype.draw = function (ctx) {
              ctx.beginPath();

              for (var i = 0; i < this.commands.length; i += 1) {
                var cmd = this.commands[i];

                if (cmd.type === 'M') {
                  ctx.moveTo(cmd.x, cmd.y);
                } else if (cmd.type === 'L') {
                  ctx.lineTo(cmd.x, cmd.y);
                } else if (cmd.type === 'C') {
                  ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
                } else if (cmd.type === 'Q') {
                  ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
                } else if (cmd.type === 'Z') {
                  ctx.closePath();
                }
              }

              if (this.fill) {
                ctx.fillStyle = this.fill;
                ctx.fill();
              }

              if (this.stroke) {
                ctx.strokeStyle = this.stroke;
                ctx.lineWidth = this.strokeWidth;
                ctx.stroke();
              }
            };
            /**
             * Convert the Path to a string of path data instructions
             * See http://www.w3.org/TR/SVG/paths.html#PathData
             * @param  {number} [decimalPlaces=2] - The amount of decimal places for floating-point values
             * @return {string}
             */


            Path.prototype.toPathData = function (decimalPlaces) {
              decimalPlaces = decimalPlaces !== undefined ? decimalPlaces : 2;

              function floatToString(v) {
                if (Math.round(v) === v) {
                  return '' + Math.round(v);
                } else {
                  return v.toFixed(decimalPlaces);
                }
              }

              function packValues() {
                var s = '';

                for (var i = 0; i < arguments.length; i += 1) {
                  var v = arguments[i];

                  if (v >= 0 && i > 0) {
                    s += ' ';
                  }

                  s += floatToString(v);
                }

                return s;
              }

              var d = '';

              for (var i = 0; i < this.commands.length; i += 1) {
                var cmd = this.commands[i];

                if (cmd.type === 'M') {
                  d += 'M' + packValues(cmd.x, cmd.y);
                } else if (cmd.type === 'L') {
                  d += 'L' + packValues(cmd.x, cmd.y);
                } else if (cmd.type === 'C') {
                  d += 'C' + packValues(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
                } else if (cmd.type === 'Q') {
                  d += 'Q' + packValues(cmd.x1, cmd.y1, cmd.x, cmd.y);
                } else if (cmd.type === 'Z') {
                  d += 'Z\n';
                }
              }

              return d;
            };
            /**
             * Convert the path to an SVG <path> element, as a string.
             * @param  {number} [decimalPlaces=2] - The amount of decimal places for floating-point values
             * @return {string}
             */


            Path.prototype.toSVG = function (decimalPlaces) {
              var svg = '<path d="';
              svg += this.toPathData(decimalPlaces);
              svg += '"';

              if (this.fill && this.fill !== 'black') {
                if (this.fill === null) {
                  svg += ' fill="none"';
                } else {
                  svg += ' fill="' + this.fill + '"';
                }
              }

              if (this.stroke) {
                svg += ' stroke="' + this.stroke + '" stroke-width="' + this.strokeWidth + '"';
              }

              svg += '/>';
              return svg;
            };
            /**
             * Convert the path to a DOM element.
             * @param  {number} [decimalPlaces=2] - The amount of decimal places for floating-point values
             * @return {SVGPathElement}
             */


            Path.prototype.toDOMElement = function (decimalPlaces) {
              var temporaryPath = this.toPathData(decimalPlaces);
              var newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              newPath.setAttribute('d', temporaryPath);
              return newPath;
            };

            function Glyph(options) {
              this.name = options.name;
              this.font = options.font;
              this.url = this.font.glyphFileFromName(this.name);
              this.loaded = false;
              Object.defineProperty(this, "advanceWidth", {
                get: function get() {
                  return this.load().then(function (s) {
                    return s["_advanceWidth"];
                  });
                }
              });
              Object.defineProperty(this, "unicodes", {
                get: function get() {
                  return this.load().then(function (s) {
                    return s["_unicodes"];
                  });
                }
              });
              Object.defineProperty(this, "outline", {
                get: function get() {
                  return this.load().then(function (s) {
                    return s["_outline"];
                  });
                }
              });
            }

            Glyph.prototype.load = function () {
              var _this = this;

              if (this.loaded) {
                return bluebird.resolve(this);
              }

              return openXML(this.url, this.font.loadOptions).then(function (data) {
                _this.loaded = true;
                _this.fromSource = data.glyph;

                if (data.glyph.advance) {
                  _this._advanceWidth = Number(data.glyph.advance[0]["$"]["width"]);
                }

                _this._unicodes = (data.glyph.unicode || []).map(function (x) {
                  return parseInt(x["$"]["hex"], 16);
                });

                if (_this._unicodes[0]) {
                  // This is naughty and should be documented
                  _this.font._glyphCache[String.fromCodePoint(_this._unicodes[0])] = _this;
                }

                _this._outline = data.glyph.outline[0];
                _this._components = _this._outline.component || [];
                _this._components = _this._components.map(function (c) {
                  return c["$"];
                });
                _this._contours = _this._outline && _this._outline.contour || [];

                for (var cIdx in _this._contours) {
                  _this._contours[cIdx] = _this._contours[cIdx].point.map(function (p) {
                    return p["$"];
                  });
                }

                return _this;
              });
            };

            Glyph.prototype.getPath = function (x, y, fontSize, options) {
              var _this2 = this;

              var path = new Path();
              x = x !== undefined ? x : 0;
              y = y !== undefined ? y : 0;
              fontSize = fontSize !== undefined ? fontSize : 72;
              if (!options) options = {};
              var scale = 1 / this.font.unitsPerEm * fontSize;
              return this.load().then(function () {
                return bluebird.all(_this2._components.map(function (g) {
                  return _this2.font.getGlyph(g.base).load();
                }));
              }).then(function () {
                // Place base components on path
                return bluebird.all(_this2._components.map(function (c) {
                  var matrix1 = [Number(c.xScale || 1), Number(c.xyScale || 0), Number(c.yxScale || 0), -Number(c.yScale || 1), Number(c.xOffset || 0), Number(c.yOffset || 0)];
                  var matrix2 = [scale, 0, 0, -scale, x, y];
                  return _this2.font.getGlyph(c.base).getPath(0, 0, _this2.font.unitsPerEm).then(function (p) {
                    path.extend(p.transform(matrix1).transform(matrix2));
                  });
                }));
              }).then(function () {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                  var _loop = function _loop() {
                    c = _step.value;
                    // For a closed path (as most should be) start with the first oncurve
                    // if (c[0].type == "move") { throw "Open paths not supported yet"}
                    firstOncurve = c.findIndex(function (p) {
                      return p.type != "offcurve";
                    });
                    path.moveTo(x + c[firstOncurve].x * scale, y - c[firstOncurve].y * scale);

                    var prev = function prev(i) {
                      if (i - 1 < 0) {
                        i += c.length;
                      }

                      return c[i - 1];
                    };

                    var prevPrev = function prevPrev(i) {
                      if (i - 2 < 0) {
                        i += c.length;
                      }

                      return c[i - 2];
                    };

                    var handleNode = function handleNode(i) {
                      var node = c[i];

                      if (!node) {
                        return;
                      }

                      if (node.type == "offcurve") {
                        off.push(node);
                      }

                      if (node.type == "line") {
                        path.lineTo(x + node.x * scale, y - node.y * scale);
                      } else if (node.type == "curve") {
                        path.curveTo(x + prevPrev(i).x * scale, y - prevPrev(i).y * scale, x + prev(i).x * scale, y - prev(i).y * scale, x + node.x * scale, y - node.y * scale);
                      }
                    };

                    for (i = firstOncurve + 1; i < c.length; i++) {
                      handleNode(i);
                    }

                    for (i = 0; i <= firstOncurve; i++) {
                      handleNode(i);
                    }
                  };

                  for (var _iterator = _this2._contours[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var c;
                    var firstOncurve;
                    var i;
                    var i;

                    _loop();
                  }
                } catch (err) {
                  _didIteratorError = true;
                  _iteratorError = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion && _iterator.return != null) {
                      _iterator.return();
                    }
                  } finally {
                    if (_didIteratorError) {
                      throw _iteratorError;
                    }
                  }
                }

                path.close();
                return path;
              });
            };

            Glyph.prototype.draw = function (ctx, x, y, fontSize, options) {
              this.getPath(x, y, fontSize, options).then(function (path) {
                return path.draw(ctx);
              });
            };

            function Font(options) {
              options = options || {};

              if (!options.empty) {
                console.log("Grumble");
              }

              this.root = options.root;
              this._glyphCache = {}; // XXX
            }

            Font.prototype.defaultRenderOptions = {
              kerning: true // features: {
              //     liga: true,
              //     rlig: true
              // }

            };

            Font.prototype.getGlyph = function (name) {
              if (!this._glyphCache[name]) this._glyphCache[name] = new Glyph({
                font: this,
                name: name
              });
              return this._glyphCache[name];
            };

            Font.prototype.loadAllGlyphs = function () {
              var _this = this;

              return bluebird.all(Object.keys(this.glyphtable).map(function (g) {
                return _this.getGlyph(g).load();
              }));
            };

            Font.prototype.glyphFileFromName = function (name) {
              var filename = this.glyphtable[name];

              if (!filename) {
                throw "Glyph '" + name + "' not found in glyph table";
              }

              return this.root + "/glyphs/" + filename;
            };

            Font.prototype.stringToGlyphs = function (s, options) {
              var _this2 = this;

              options = options || this.defaultRenderOptions;
              var array = s.split(/\/([\w\.]+)\s?|/).filter(Boolean);

              if (options.features) {
                throw "Sorry, features not implemented yet";
              } // XXX This doesn't exactly do the right thing


              return array.map(function (s) {
                return _this2.getGlyph(s);
              });
            };

            Font.prototype._findGroups = function (glyphname) {
              var groups = this.groups;
              var found = [];

              if (!groups) {
                return null;
              }

              for (var group in groups) {
                var index = groups[group].indexOf(glyphname);
                if (index > -1) found.push(group);
              }

              return found;
            };

            Font.prototype.getKerningValue = function (leftGlyph, rightGlyph) {
              if (leftGlyph.name) {
                leftGlyph = leftGlyph.name;
              }

              if (rightGlyph.name) {
                rightGlyph = rightGlyph.name;
              }

              if (!this.kerning) {
                return null;
              } // First, check for the existence of a kern pair directly


              if (leftGlyph in this.kerning && rightGlyph in this.kerning[leftGlyph]) {
                return this.kerning[leftGlyph][rightGlyph];
              }

              if (!this.groups) {
                return null;
              }

              var lglyphGroups = this._findGroups(leftGlyph);

              var rglyphGroups = this._findGroups(rightGlyph); // XXX Unsure of correct lookup order here


              var _iteratorNormalCompletion = true;
              var _didIteratorError = false;
              var _iteratorError = undefined;

              try {
                for (var _iterator = lglyphGroups[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  var lgroup = _step.value;
                  var tryLeft = this.getKerningValue(lgroup, rightGlyph);

                  if (tryLeft !== null) {
                    return tryLeft;
                  }
                }
              } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                  }
                } finally {
                  if (_didIteratorError) {
                    throw _iteratorError;
                  }
                }
              }

              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = rglyphGroups[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var rgroup = _step2.value;
                  var tryRight = this.getKerningValue(leftGlyph, rgroup);

                  if (tryRight !== null) {
                    return tryRight;
                  }
                }
              } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                    _iterator2.return();
                  }
                } finally {
                  if (_didIteratorError2) {
                    throw _iteratorError2;
                  }
                }
              }

              var _iteratorNormalCompletion3 = true;
              var _didIteratorError3 = false;
              var _iteratorError3 = undefined;

              try {
                for (var _iterator3 = lglyphGroups[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                  var lgroup = _step3.value;
                  var _iteratorNormalCompletion4 = true;
                  var _didIteratorError4 = false;
                  var _iteratorError4 = undefined;

                  try {
                    for (var _iterator4 = rglyphGroups[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                      var rgroup = _step4.value;
                      var tryBoth = this.getKerningValue(lgroup, rgroup);

                      if (tryBoth !== null) {
                        return tryBoth;
                      }
                    }
                  } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
                        _iterator4.return();
                      }
                    } finally {
                      if (_didIteratorError4) {
                        throw _iteratorError4;
                      }
                    }
                  }
                }
              } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                    _iterator3.return();
                  }
                } finally {
                  if (_didIteratorError3) {
                    throw _iteratorError3;
                  }
                }
              }

              return null;
            };

            Font.prototype.forEachGlyph = function (text, x, y, fontSize, options, callback) {
              var _this3 = this;

              x = x !== undefined ? x : 0;
              y = y !== undefined ? y : 0;
              fontSize = fontSize !== undefined ? fontSize : 72;
              options = options || this.defaultRenderOptions;
              var fontScale = 1 / this.unitsPerEm * fontSize;
              var glyphs = this.stringToGlyphs(text, options);

              return bluebird.all(glyphs.map(function (g) {
                return g.load();
              })).then(function () {
                for (var i = 0; i < glyphs.length; i += 1) {
                  var glyph = glyphs[i];
                  callback.call(_this3, glyph, x, y, fontSize, options);

                  if (glyph._advanceWidth) {
                    x += glyph._advanceWidth * fontScale;
                  }

                  if (options.kerning && i < glyphs.length - 1) {
                    var kerningValue = _this3.getKerningValue(glyph, glyphs[i + 1]);

                    x += kerningValue * fontScale;
                  }

                  if (options.letterSpacing) {
                    x += options.letterSpacing * fontSize;
                  } else if (options.tracking) {
                    x += options.tracking / 1000 * fontSize;
                  }
                }

                return x;
              });
            };

            Font.prototype.draw = function (ctx, text, x, y, fontSize, options) {
              this.forEachGlyph(text, x, y, fontSize, options, function (glyph, gX, gY, gFontSize) {
                glyph.getPath(gX, gY, gFontSize, options).then(function (p) {
                  return p.draw(ctx);
                });
              });
            };

            Font.prototype.getAdvanceWidth = function (text, fontSize, options) {
              return this.forEachGlyph(text, 0, 0, fontSize, options, function () {});
            };

            // import 'string.prototype.codepointat';

            function load(url, callback, options) {
              var font = new Font({
                empty: true,
                root: url
              });
              font.loadOptions = options;
              openPlist(url + "/metainfo.plist", options).then(function (o) {
                font.metainfo = o;
              }).then(function () {
                return openPlist(url + "/fontinfo.plist", options);
              }).then(function (o) {
                font.fontinfo = o;
                font.ascender = font.fontinfo.ascender;
                font.descender = font.fontinfo.descender;
                font.unitsPerEm = font.fontinfo.unitsPerEm;
              }).then(function () {
                return openPlist(url + "/glyphs/contents.plist", options);
              }).then(function (o) {
                return font.glyphtable = o;
              }).then(function () {
                // Group data is optional.
                return openPlist(url + "/groups.plist", options).then(function (o) {
                  return font.groups = o;
                }).catch(function (e) {});
              }).then(function () {
                // Kerning data is optional.
                return openPlist(url + "/kerning.plist", options).then(function (o) {
                  return font.kerning = o;
                }).catch(function (e) {});
              }).then(function () {
                return callback(null, font);
              }).catch(function (e) {
                return callback(e, null);
              });
            }

            exports.load = load;

            Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ufo.js.map
