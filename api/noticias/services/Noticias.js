/* global Noticias */
'use strict';

/**
 * Noticias.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

// Public dependencies.
const _ = require('lodash');

// Strapi utilities.
const utils = require('strapi-hook-bookshelf/lib/utils/');
const { convertRestQueryParams, buildQuery } = require('strapi-utils');


module.exports = {

  /**
   * Promise to fetch all noticias.
   *
   * @return {Promise}
   */

  fetchAll: (params, populate) => {
    // Select field to populate.
    const withRelated = populate || Noticias.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias);

    const filters = convertRestQueryParams(params);

    return Noticias.query(buildQuery({ model: Noticias, filters }))
      .fetchAll({ withRelated })
      .then(data => data.toJSON());
  },

  /**
   * Promise to fetch a/an noticias.
   *
   * @return {Promise}
   */

  fetch: (params) => {
    // Select field to populate.
    const populate = Noticias.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias);

    return Noticias.forge(_.pick(params, 'id')).fetch({
      withRelated: populate
    });
  },

  /**
   * Promise to count a/an noticias.
   *
   * @return {Promise}
   */

  count: (params) => {
    // Convert `params` object to filters compatible with Bookshelf.
    const filters = convertRestQueryParams(params);

    return Noticias.query(buildQuery({ model: Noticias, filters: _.pick(filters, 'where') })).count();
  },

  /**
   * Promise to add a/an noticias.
   *
   * @return {Promise}
   */

  add: async (values) => {
    // Extract values related to relational data.
    const relations = _.pick(values, Noticias.associations.map(ast => ast.alias));
    const data = _.omit(values, Noticias.associations.map(ast => ast.alias));

    // Create entry with no-relational data.
    const entry = await Noticias.forge(data).save();

    // Create relational data and return the entry.
    return Noticias.updateRelations({ id: entry.id , values: relations });
  },

  /**
   * Promise to edit a/an noticias.
   *
   * @return {Promise}
   */

  edit: async (params, values) => {
    // Extract values related to relational data.
    const relations = _.pick(values, Noticias.associations.map(ast => ast.alias));
    const data = _.omit(values, Noticias.associations.map(ast => ast.alias));

    // Create entry with no-relational data.
    const entry = await Noticias.forge(params).save(data);

    // Create relational data and return the entry.
    return Noticias.updateRelations(Object.assign(params, { values: relations }));
  },

  /**
   * Promise to remove a/an noticias.
   *
   * @return {Promise}
   */

  remove: async (params) => {
    params.values = {};
    Noticias.associations.map(association => {
      switch (association.nature) {
        case 'oneWay':
        case 'oneToOne':
        case 'manyToOne':
        case 'oneToManyMorph':
          params.values[association.alias] = null;
          break;
        case 'oneToMany':
        case 'manyToMany':
        case 'manyToManyMorph':
          params.values[association.alias] = [];
          break;
        default:
      }
    });

    await Noticias.updateRelations(params);

    return Noticias.forge(params).destroy();
  },

  /**
   * Promise to search a/an noticias.
   *
   * @return {Promise}
   */

  search: async (params) => {
    // Convert `params` object to filters compatible with Bookshelf.
    const filters = strapi.utils.models.convertParams('noticias', params);
    // Select field to populate.
    const populate = Noticias.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias);

    const associations = Noticias.associations.map(x => x.alias);
    const searchText = Object.keys(Noticias._attributes)
      .filter(attribute => attribute !== Noticias.primaryKey && !associations.includes(attribute))
      .filter(attribute => ['string', 'text'].includes(Noticias._attributes[attribute].type));

    const searchInt = Object.keys(Noticias._attributes)
      .filter(attribute => attribute !== Noticias.primaryKey && !associations.includes(attribute))
      .filter(attribute => ['integer', 'decimal', 'float'].includes(Noticias._attributes[attribute].type));

    const searchBool = Object.keys(Noticias._attributes)
      .filter(attribute => attribute !== Noticias.primaryKey && !associations.includes(attribute))
      .filter(attribute => ['boolean'].includes(Noticias._attributes[attribute].type));

    const query = (params._q || '').replace(/[^a-zA-Z0-9.-\s]+/g, '');

    return Noticias.query(qb => {
      if (!_.isNaN(_.toNumber(query))) {
        searchInt.forEach(attribute => {
          qb.orWhereRaw(`${attribute} = ${_.toNumber(query)}`);
        });
      }

      if (query === 'true' || query === 'false') {
        searchBool.forEach(attribute => {
          qb.orWhereRaw(`${attribute} = ${_.toNumber(query === 'true')}`);
        });
      }

      // Search in columns with text using index.
      switch (Noticias.client) {
        case 'mysql':
          qb.orWhereRaw(`MATCH(${searchText.join(',')}) AGAINST(? IN BOOLEAN MODE)`, `*${query}*`);
          break;
        case 'pg': {
          const searchQuery = searchText.map(attribute =>
            _.toLower(attribute) === attribute
              ? `to_tsvector(${attribute})`
              : `to_tsvector('${attribute}')`
          );

          qb.orWhereRaw(`${searchQuery.join(' || ')} @@ to_tsquery(?)`, query);
          break;
        }
      }

      if (filters.sort) {
        qb.orderBy(filters.sort.key, filters.sort.order);
      }

      if (filters.skip) {
        qb.offset(_.toNumber(filters.skip));
      }

      if (filters.limit) {
        qb.limit(_.toNumber(filters.limit));
      }
    }).fetchAll({
      withRelated: populate
    });
  }
};
