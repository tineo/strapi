'use strict';

/**
 * Noticias.js controller
 *
 * @description: A set of functions called "actions" for managing `Noticias`.
 */

module.exports = {

  /**
   * Retrieve noticias records.
   *
   * @return {Object|Array}
   */

  find: async (ctx, next, { populate } = {}) => {
    if (ctx.query._q) {
      return strapi.services.noticias.search(ctx.query);
    } else {
      return strapi.services.noticias.fetchAll(ctx.query, populate);
    }
  },

  /**
   * Retrieve a noticias record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    return strapi.services.noticias.fetch(ctx.params);
  },

  /**
   * Count noticias records.
   *
   * @return {Number}
   */

  count: async (ctx, next, { populate } = {}) => {
    return strapi.services.noticias.count(ctx.query, populate);
  },

  /**
   * Create a/an noticias record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.noticias.add(ctx.request.body);
  },

  /**
   * Update a/an noticias record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.noticias.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an noticias record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.noticias.remove(ctx.params);
  }
};
