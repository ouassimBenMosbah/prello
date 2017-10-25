'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const CheckListSchema = require('mongoose').model('Checklist').schema
const AttachmentSchema = require('mongoose').model('Attachment').schema
const CommentSchema = require('mongoose').model('Comment').schema

const CardSchema = new Schema({
    titleCard: {
      type: String
    },
    description: {
      type: String
    },
    dueDate: {
      type: Date
    },
    doneDate: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    checklists : [CheckListSchema],
    attachments : [AttachmentSchema],
    comments : [CommentSchema],
    labels : {
      type: [Schema.ObjectId],
      ref: 'Label'
    }
  });

  module.exports = mongoose.model('Card', CardSchema);