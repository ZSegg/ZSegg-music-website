/**
 * 图片处理工具函数
 */

/**
 * 获取图片URL
 * @param {string} url - 图片路径
 * @returns {string} 完整的图片URL
 */
export const getImageUrl = (url) => {
  if (!url) return "/404.jpg";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) {
    // 如果是以/uploads/开头的路径，转换为/api/uploads/
    if (url.startsWith("/uploads/")) {
      return url.replace("/uploads/", "/api/uploads/");
    }
    url = url.slice(1);
  }
  // console.log(`/api/uploads/${url}`);
  return `/api/uploads/${url}`;
};

/**
 * 处理图片加载错误
 * @param {Event} event - 图片错误事件
 */
export const handleImageError = (event) => {
  event.target.src = "/404.jpg";
};

/**
 * 预加载图片
 * @param {string} url - 图片URL
 * @returns {Promise} 图片加载完成的Promise
 */
export const preloadImage = (url) => {
  // console.log(url);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * 图片懒加载指令
 */
export const lazyLoad = {
  mounted(el, binding) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.src = binding.value;
          observer.unobserve(el);
        }
      });
    });
    observer.observe(el);
  },
};

/**
 * 压缩图片
 * @param {File} file - 图片文件
 * @param {number} maxWidth - 最大宽度
 * @param {number} maxHeight - 最大高度
 * @param {number} quality - 压缩质量 (0-1)
 * @returns {Promise<Blob>} 压缩后的图片
 */
export const compressImage = (
  file,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8
) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // 计算缩放比例
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(resolve, "image/jpeg", quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * 获取图片尺寸
 * @param {string} url - 图片URL
 * @returns {Promise<{width: number, height: number}>} 图片尺寸
 */
export const getImageSize = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = reject;
    img.src = url;
  });
};
