import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Download, Smartphone, Share2, PlusSquare, CheckCircle, Apple, Chrome } from 'lucide-react';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstalled?: () => void;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstalled,
}) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if running as installed standalone app
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Check if iOS device (iPhone/iPad/iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);
  }, []);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    try {
      setIsInstalling(true);
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        if (onInstalled) onInstalled();
        onClose();
      }
    } catch (err) {
      console.error('Install prompt error:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="نصب اپلیکیشن AssetPulse روی گوشی" maxWidth="md">
      <div className="space-y-5 text-xs text-slate-300">
        {/* App Preview Card */}
        <div className="p-4 rounded-2xl bg-dark-900 border border-white/10 flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-amber-500 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">AssetPulse Mobile PWA</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              تجربه اپلیکیشن بومی، بدون نوار آدرس مرورگر، سرعت فوق‌العاده و کارکرد آفلاین.
            </p>
          </div>
        </div>

        {isStandalone ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-2.5">
            <CheckCircle size={20} className="text-emerald-400 shrink-0" />
            <span>تبریک! این اپلیکیشن در حال حاضر به عنوان وب‌اپلیکیشن روی دستگاه شما نصب و در حال اجراست.</span>
          </div>
        ) : isIOS ? (
          /* iOS Safari Guide */
          <div className="space-y-3">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
              <Apple size={16} />
              <span>راهنمای نصب روی آیفون و آیپد (iOS Safari):</span>
            </div>

            <ol className="space-y-2.5">
              <li className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  ۱
                </span>
                <div className="leading-relaxed">
                  در نوار ابزار پایین مرورگر <strong>Safari</strong>، دکمه اشتراک‌گذاری{' '}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] mx-1">
                    <Share2 size={11} className="mr-0.5 inline" /> Share
                  </span>{' '}
                  را لمس کنید.
                </div>
              </li>

              <li className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  ۲
                </span>
                <div className="leading-relaxed">
                  در منوی باز شده به پایین اسکرول کرده و گزینه{' '}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/10 text-white font-bold text-[10px] mx-1">
                    <PlusSquare size={11} className="mr-0.5 inline" /> Add to Home Screen (افزودن به صفحه اصلی)
                  </span>{' '}
                  را انتخاب نمایید.
                </div>
              </li>

              <li className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  ۳
                </span>
                <div className="leading-relaxed">
                  در بالای صفحه گوشه راست، دکمه <strong>Add (افزودن)</strong> را بزنید. آیکون AssetPulse به فهرست اپ‌های شما اضافه شد!
                </div>
              </li>
            </ol>
          </div>
        ) : (
          /* Android / Chrome Direct Install */
          <div className="space-y-4">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs">
              <Chrome size={16} />
              <span>نصب مستقیم روی اندروید، ویندوز و مرورگر کروم:</span>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              با کلیک روی دکمه زیر، فایل وب‌اپلیکیشن بدون نیاز به مراجعه به کافه‌بازار یا گوگل‌پلی مستقیماً روی صفحه گوشی شما قرار می‌گیرد.
            </p>

            {deferredPrompt ? (
              <button
                type="button"
                onClick={handleNativeInstall}
                disabled={isInstalling}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <Download size={16} />
                <span>{isInstalling ? 'در حال آماده‌سازی...' : 'نصب مستقیم اپلیکیشن (Install Now)'}</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                <p className="text-[11px] text-slate-300">
                  اگر مرورگر پیام نصب خودکار را نشان نداد، از منوی ۳ نقطه مرورگر گزینه{' '}
                  <strong>«Install App»</strong> یا <strong>«افزودن به صفحه اصلی (Add to Home Screen)»</strong> را لمس کنید.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Benefits List */}
        <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>کارکرد آفلاین بدون اینترنت</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span>بدون اشغال حافظه و حجم کمتر از ۱ مگابایت</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
            <span>به‌روزرسانی آنی و خودکار</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
            <span>حفظ کامل حریم خصوصی</span>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-dark-900 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </Modal>
  );
};
