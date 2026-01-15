'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Copy, Check, ExternalLink } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  text: string;
  url: string;
  hashtags?: string[];
  via?: string;
}

interface SocialPlatform {
  name: string;
  icon: React.ReactNode;
  color: string;
  getUrl: (params: ShareButtonsProps) => string;
}

// Twitter/X Icon
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Facebook Icon
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// LinkedIn Icon
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// WhatsApp Icon
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const PLATFORMS: SocialPlatform[] = [
  {
    name: 'Twitter',
    icon: <TwitterIcon />,
    color: 'bg-black hover:bg-neutral-800',
    getUrl: ({ text, url, hashtags, via }) => {
      const params = new URLSearchParams({
        text,
        url,
      });
      if (hashtags?.length) params.set('hashtags', hashtags.join(','));
      if (via) params.set('via', via);
      return `https://twitter.com/intent/tweet?${params.toString()}`;
    },
  },
  {
    name: 'Facebook',
    icon: <FacebookIcon />,
    color: 'bg-[#1877F2] hover:bg-[#166FE5]',
    getUrl: ({ url }) => {
      const params = new URLSearchParams({ u: url });
      return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
    },
  },
  {
    name: 'LinkedIn',
    icon: <LinkedInIcon />,
    color: 'bg-[#0A66C2] hover:bg-[#004182]',
    getUrl: ({ url, title }) => {
      const params = new URLSearchParams({ url, title });
      return `https://www.linkedin.com/shareArticle?mini=true&${params.toString()}`;
    },
  },
  {
    name: 'WhatsApp',
    icon: <WhatsAppIcon />,
    color: 'bg-[#25D366] hover:bg-[#20BD5A]',
    getUrl: ({ text, url }) => {
      const params = new URLSearchParams({ text: `${text}\n${url}` });
      return `https://api.whatsapp.com/send?${params.toString()}`;
    },
  },
];

export function ShareButtons({ title, text, url, hashtags, via }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = `${text}\n${url}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User cancelled
      }
    } else {
      setIsOpen(true);
    }
  };

  const openShareWindow = (platform: SocialPlatform) => {
    const shareUrl = platform.getUrl({ title, text, url, hashtags, via });
    window.open(shareUrl, '_blank', 'width=600,height=400,menubar=no,toolbar=no');
  };

  return (
    <>
      {/* Main Share Button */}
      <button
        onClick={handleNativeShare}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all"
      >
        <Share2 className="w-5 h-5" />
        Share
      </button>

      {/* Share Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Share</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => openShareWindow(platform)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl ${platform.color} transition-colors`}
                    title={`Share on ${platform.name}`}
                  >
                    {platform.icon}
                    <span className="text-xs">{platform.name}</span>
                  </button>
                ))}
              </div>

              {/* Copy Link */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  readOnly
                  className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-300 truncate"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl hover:bg-neutral-700 transition-colors"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Inline share buttons (horizontal row)
 */
export function InlineShareButtons({ title, text, url, hashtags, via }: ShareButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {PLATFORMS.map((platform) => (
        <a
          key={platform.name}
          href={platform.getUrl({ title, text, url, hashtags, via })}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2 rounded-lg ${platform.color} transition-colors`}
          title={`Share on ${platform.name}`}
        >
          {platform.icon}
        </a>
      ))}
    </div>
  );
}

export default ShareButtons;
