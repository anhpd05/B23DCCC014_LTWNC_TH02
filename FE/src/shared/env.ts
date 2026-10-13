/**
 * Điểm duy nhất đọc `import.meta.env`: Jest (CommonJS) không biên dịch được
 * `import.meta`, nên test map module này sang bản stub.
 */
export const IS_DEV: boolean = import.meta.env.DEV;
