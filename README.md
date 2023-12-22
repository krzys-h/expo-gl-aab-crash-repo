I've ran into a really weird issue which causes expo-gl to crash when creating the context on Android, but only if the app is built in very specific conditions. Specifically, it only crashes if the app was built on Windows, into an .aab format to be uploaded to Google Play. Everything works fine when I build from linux, and everything works fine if I build an .apk instead. It also works if I export an universal .apk from the .aab, rather than using the split apks Google Play normally generates.

I attached a minimal reproducible example, but the code is literally just creating an empty GLView. What matters are the build steps. Here are the configurations I tried:

```sh
# build a standard .apk
npx expo prebuild --platform=android --no-install
cd android
gradlew.bat assembleRelease
adb install app/build/outputs/apk/release/app-release.apk
# works fine

# build an .abb, and install in universal .apk mode
npx expo prebuild --platform=android --no-install
cd android
gradlew.bat bundleRelease
java -jar bundletool-all-1.15.6.jar build-apks --bundle app/build/outputs/bundle/release/app-release.aab --output app.apks --mode universal
java -jar bundletool-all-1.15.6.jar install-apks --apks app.apks
# works fine

# build an .abb, and install it in default split .apk mode
npx expo prebuild --platform=android --no-install
cd android
gradlew.bat bundleRelease
java -jar bundletool-all-1.15.6.jar build-apks --bundle app/build/outputs/bundle/release/app-release.aab --output app.apks
java -jar bundletool-all-1.15.6.jar install-apks --apks app.apks
# CRASHES!

# all of the variants above, but building on my Linux laptop rather than the Windows server we use for CI
# works fine, even in the split .apk case!!
```

To isolate any other variables, I fully reinstalled the Android SDK on both machines, letting Expo reinstall whatever it needs from scratch and the issue still happens.

Here is the crash log I get:
```
12-22 20:50:05.622 11664 11729 F libc    : Fatal signal 11 (SIGSEGV), code 1 (SEGV_MAPERR), fault addr 0x1f02 in tid 11729 (Thread-7), pid 11664 (glaabcrashrepro)
12-22 20:50:06.143 11734 11734 F DEBUG   : *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
12-22 20:50:06.143 11734 11734 F DEBUG   : Build fingerprint: 'samsung/y2seea/y2s:13/TP1A.220624.014/G985FXXSIHWJD:user/release-keys'
12-22 20:50:06.143 11734 11734 F DEBUG   : Revision: '22'
12-22 20:50:06.143 11734 11734 F DEBUG   : ABI: 'arm64'
12-22 20:50:06.143 11734 11734 F DEBUG   : Processor: '3'
12-22 20:50:06.143 11734 11734 F DEBUG   : Timestamp: 2023-12-22 20:50:05.714224079+0100
12-22 20:50:06.143 11734 11734 F DEBUG   : Process uptime: 2s
12-22 20:50:06.143 11734 11734 F DEBUG   : Cmdline: com.anonymous.glaabcrashrepro
12-22 20:50:06.143 11734 11734 F DEBUG   : pid: 11664, tid: 11729, name: Thread-7  >>> com.anonymous.glaabcrashrepro <<<
12-22 20:50:06.143 11734 11734 F DEBUG   : uid: 10571
12-22 20:50:06.143 11734 11734 F DEBUG   : signal 11 (SIGSEGV), code 1 (SEGV_MAPERR), fault addr 0x0000000000001f02
12-22 20:50:06.143 11734 11734 F DEBUG   :     x0  0000000000001f02  x1  0000007316929824  x2  0000007527719a40  x3  0000007474555660
12-22 20:50:06.143 11734 11734 F DEBUG   :     x4  0000000000000f02  x5  0000000000000000  x6  0000000000000000  x7  694b1aff3a736264
12-22 20:50:06.143 11734 11734 F DEBUG   :     x8  38f3aa2c5e24b146  x9  0000000000000002  x10 0000000000000001  x11 0000000000000001
12-22 20:50:06.143 11734 11734 F DEBUG   :     x12 0000000000000001  x13 0000000000000001  x14 0000007792c6f1d6  x15 000000000000000a
12-22 20:50:06.143 11734 11734 F DEBUG   :     x16 000000731697cb90  x17 0000007773369340  x18 000000731730c000  x19 00000074b776c800
12-22 20:50:06.143 11734 11734 F DEBUG   :     x20 00000073e7af54a0  x21 0000000000001f02  x22 0000000000000000  x23 00000074a77c4080
12-22 20:50:06.143 11734 11734 F DEBUG   :     x24 0000007317bfc000  x25 0000007527719a10  x26 0000007317bfb92c  x27 0000007317bfb920
12-22 20:50:06.143 11734 11734 F DEBUG   :     x28 0000007317bfb940  x29 0000007317bfb738
12-22 20:50:06.143 11734 11734 F DEBUG   :     lr  0000007316929868  sp  0000007317bfb6f0  pc  0000007773369350  pst 0000000080001000
12-22 20:50:06.143 11734 11734 F DEBUG   : backtrace:
12-22 20:50:06.143 11734 11734 F DEBUG   :       #00 pc 000000000004b350  /apex/com.android.runtime/lib64/bionic/libc.so (__strlen_aarch64+16) (BuildId: 173441c90e5afc5b5229a361bc9d8d2d)
12-22 20:50:06.143 11734 11734 F DEBUG   :       #01 pc 0000000000099864  /data/app/~~jxdH6M5ZQtjAlgQK7V_8ew==/com.anonymous.glaabcrashrepro-GZkbaOdLVqs_cYXSW6KuMg==/split_config.arm64_v8a.apk!libexpo-gl.so (BuildId: ca144098fbfa6930dd9db94405e4d8a57f98ac2f)
12-22 20:50:06.143 11734 11734 F DEBUG   :       #02 pc 0000000000098c48  /data/app/~~jxdH6M5ZQtjAlgQK7V_8ew==/com.anonymous.glaabcrashrepro-GZkbaOdLVqs_cYXSW6KuMg==/split_config.arm64_v8a.apk!libexpo-gl.so (std::__ndk1::packaged_task<void ()>::operator()()+88) (BuildId: ca144098fbfa6930dd9db94405e4d8a57f98ac2f)
12-22 20:50:06.143 11734 11734 F DEBUG   :       #03 pc 0000000000097d88  /data/app/~~jxdH6M5ZQtjAlgQK7V_8ew==/com.anonymous.glaabcrashrepro-GZkbaOdLVqs_cYXSW6KuMg==/split_config.arm64_v8a.apk!libexpo-gl.so (expo::gl_cpp::EXGLContext::flush()+112) (BuildId: ca144098fbfa6930dd9db94405e4d8a57f98ac2f)
12-22 20:50:06.143 11734 11734 F DEBUG   :       #04 pc 00000000000780cc  /data/app/~~jxdH6M5ZQtjAlgQK7V_8ew==/com.anonymous.glaabcrashrepro-GZkbaOdLVqs_cYXSW6KuMg==/split_config.arm64_v8a.apk!libexpo-gl.so (EXGLContextFlush+44) (BuildId: ca144098fbfa6930dd9db94405e4d8a57f98ac2f)
12-22 20:50:06.143 11734 11734 F DEBUG   :       #05 pc 000000000007d2e4  /data/app/~~jxdH6M5ZQtjAlgQK7V_8ew==/com.anonymous.glaabcrashrepro-GZkbaOdLVqs_cYXSW6KuMg==/oat/arm64/base.odex (art_jni_trampoline+116)
12-22 20:50:06.143 11734 11734 F DEBUG   :       #06 pc 00000000005b9798  /apex/com.android.art/lib64/libart.so (nterp_helper+152) (BuildId: 735f12f804f88d62a2cb437261076ff7)
12-22 20:50:06.143 11734 11734 F DEBUG   :       #07 pc 00000000003ac590  /data/app/~~jxdH6M5ZQtjAlgQK7V_8ew==/com.anonymous.glaabcrashrepro-GZkbaOdLVqs_cYXSW6KuMg==/base.apk (expo.modules.gl.GLContext$2.run+28)
12-22 20:50:06.143 11734 11734 F DEBUG   :       #08 pc 00000000005bb474  /apex/com.android.art/lib64/libart.so (nterp_helper+7540) (BuildId: 735f12f804f88d62a2cb437261076ff7)
12-22 20:50:06.143 11734 11734 F DEBUG   :       #09 pc 00000000003ace34  /data/app/~~jxdH6M5ZQtjAlgQK7V_8ew==/com.anonymous.glaabcrashrepro-GZkbaOdLVqs_cYXSW6KuMg==/base.apk (expo.modules.gl.GLContext$GLThread.run+36)
12-22 20:50:06.143 11734 11734 F DEBUG   :       #10 pc 000000000033eda4  /apex/com.android.art/lib64/libart.so (art_quick_invoke_stub+612) (BuildId: 735f12f804f88d62a2cb437261076ff7)
12-22 20:50:06.143 11734 11734 F DEBUG   :       #11 pc 0000000000239d54  /apex/com.android.art/lib64/libart.so (art::ArtMethod::Invoke(art::Thread*, unsigned int*, unsigned int, art::JValue*, char const*)+144) (BuildId: 735f12f804f88d62a2cb437261076ff7)
12-22 20:50:06.143 11734 11734 F DEBUG   :       #12 pc 000000000053a1b0  /apex/com.android.art/lib64/libart.so (art::Thread::CreateCallback(void*)+1600) (BuildId: 735f12f804f88d62a2cb437261076ff7)
12-22 20:50:06.143 11734 11734 F DEBUG   :       #13 pc 00000000000b67a8  /apex/com.android.runtime/lib64/bionic/libc.so (__pthread_start(void*)+208) (BuildId: 173441c90e5afc5b5229a361bc9d8d2d)
12-22 20:50:06.143 11734 11734 F DEBUG   :       #14 pc 000000000005340c  /apex/com.android.runtime/lib64/bionic/libc.so (__start_thread+64) (BuildId: 173441c90e5afc5b5229a361bc9d8d2d)
```

After a lot of painful messing around with trying to get debug symbols working I figured out that the function at the top of the stack is `prepareOpenGLESContext`, and inserting some `while(1);`s in the code I figured out that the crash is coming from this line:

https://github.com/expo/expo/blob/8cd3d8502751c0326a3bcb8076ef55c816800554/packages/expo-gl/common/EXGLNativeContext.cpp#L141

This is probably the first place that tries to access GLES from native code, and the strlen call is probably a part of the `std::string` constructor trying to operate on a bad return value from `glGetString(GL_VERSION)`. I got somewhat tired of banging my head on this at this point, so this is as far as I got debugging this.
