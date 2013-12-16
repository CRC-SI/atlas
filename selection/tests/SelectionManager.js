define([
  'doh/runner',
  'dam/TestCase',
  /* Code under test */
  '../SelectionManager'
], function (doh, TestCase, SelectionManager) {

  var atlasManagers;
  var selectionManager;
  
  var mockEntity = function(id) {
    var entity = {
      _id: id,
      selected: false,
      select: function() {
        this.selected = true;
      },
      deselect: function() {
        this.selected = false;
      }
    };
    return entity;
  };
  
  var entity1 = new mockEntity(1);
  var entity2 = new mockEntity(2);
  var entity3 = new mockEntity(3);
  var entity4 = new mockEntity(4);
  
  var mockRenderManager = function() {
    var rm = {
      es: {},
      getEntity: function(id) {
        return this.es[id];
      }
    };
    rm.es[entity1._id] = entity1;
    rm.es[entity2._id] = entity2;
    rm.es[entity3._id] = entity3;
    rm.es[entity4._id] = entity4;
    return rm;
  };

  /* Begin test case definitions */
  new TestCase({

    name: 'atlas/selection/SelectionManager',

    setUp: function () {
      // summary:
      atlasManagers = {
        dom: {},
        render: mockRenderManager(),
        event: {},
        selection: {}
      };
      selectionManager = new SelectionManager(atlasManagers);
    },

    tearDown: function () {
      atlasManagers = {
        dom: {},
        event: {},
        render: {},
        selection: {}
      };
    },

    testCreate: function () {
      doh.t(selectionManager instanceof SelectionManager, 'Did not create a SelectionManager');
      doh.is(selectionManager, atlasManagers.selection, 'Reference not stored correctly');
    },
    
    testSelectEntity: function () {
      selectionManager.selectEntity(entity1._id, false);
      doh.is(entity1, selectionManager._selection[entity1._id], 'Entity1 not added to selection correctly.');
      doh.t(entity1.selected, 'Entity1 was not actually selected');
    },
    
    testSelectEntity_KeepSelection: function () {
      selectionManager.selectEntity(entity1._id, true);
      selectionManager.selectEntity(entity2._id, true);
      selectionManager.selectEntity(entity3._id, true);
      selectionManager.selectEntity(entity4._id, true);
      doh.is(entity1, selectionManager._selection[entity1._id], 'Entity1 not added to selection correctly.');
      doh.is(entity2, selectionManager._selection[entity2._id], 'Entity2 not added to selection correctly.');
      doh.is(entity3, selectionManager._selection[entity3._id], 'Entity3 not added to selection correctly.');
      doh.is(entity4, selectionManager._selection[entity4._id], 'Entity4 not added to selection correctly.');
      doh.t(entity1.selected, 'Entity1 was not actually selected');
      doh.t(entity2.selected, 'Entity2 was not actually selected');
      doh.t(entity3.selected, 'Entity3 was not actually selected');
      doh.t(entity4.selected, 'Entity4 was not actually selected');
    },
    
    testSelectEntity_ClearSelection: function () {
      selectionManager.selectEntity(entity1._id, true);
      selectionManager.selectEntity(entity2._id, true);
      selectionManager.selectEntity(entity3._id, true);
      selectionManager.selectEntity(entity4._id, false);
      doh.f(selectionManager._selection[entity1._id], 'Entity1 not deselected correctly.');
      doh.f(selectionManager._selection[entity2._id], 'Entity2 not deselected correctly.');
      doh.f(selectionManager._selection[entity3._id], 'Entity3 not deselected correctly.');
      doh.is(entity4, selectionManager._selection[entity4._id], 'Entity4 not added to selection correctly.');
      doh.f(entity1.selected, 'Entity1 was not actually deselected');
      doh.f(entity2.selected, 'Entity2 was not actually deselected');
      doh.f(entity3.selected, 'Entity3 was not actually deselected');
      doh.t(entity4.selected, 'Entity4 was not actually selected');
    },
    
    testSelectEntity_WrongID: function () {
      selectionManager.selectEntity(12345, false);
      doh.f(selectionManager._selection[12345], 'Non-existing entity "selected"');
    },
    
    testSelectEntities: function () {
      selectionManager.selectEntities([entity1._id, entity2._id, entity3._id, entity4._id]);
      doh.is(entity1, selectionManager._selection[entity1._id], 'Entity1 not added to selection correctly.');
      doh.is(entity2, selectionManager._selection[entity2._id], 'Entity2 not added to selection correctly.');
      doh.is(entity3, selectionManager._selection[entity3._id], 'Entity3 not added to selection correctly.');
      doh.is(entity4, selectionManager._selection[entity4._id], 'Entity4 not added to selection correctly.');
      doh.t(entity1.selected, 'Entity1 was not actually selected');
      doh.t(entity2.selected, 'Entity2 was not actually selected');
      doh.t(entity3.selected, 'Entity3 was not actually selected');
      doh.t(entity4.selected, 'Entity4 was not actually selected');
    },
    
    testSelectEntities_KeepSelection: function () {
      selectionManager.selectEntity(entity1._id);
      selectionManager.selectEntities([entity2._id, entity3._id, entity4._id], true);
      doh.is(entity1, selectionManager._selection[entity1._id], 'Entity1 not added to selection correctly.');
      doh.is(entity2, selectionManager._selection[entity2._id], 'Entity2 not added to selection correctly.');
      doh.is(entity3, selectionManager._selection[entity3._id], 'Entity3 not added to selection correctly.');
      doh.is(entity4, selectionManager._selection[entity4._id], 'Entity4 not added to selection correctly.');
      doh.t(entity1.selected, 'Entity1 was not actually selected');
      doh.t(entity2.selected, 'Entity2 was not actually selected');
      doh.t(entity3.selected, 'Entity3 was not actually selected');
      doh.t(entity4.selected, 'Entity4 was not actually selected');
    },
    
    testSelectEntities_ClearSelection1: function () {
      selectionManager.selectEntity(entity1._id);
      selectionManager.selectEntities([entity2._id, entity3._id, entity4._id], false);
      doh.f(selectionManager._selection[entity1._id], 'Entity1 not deselected correctly.');
      doh.is(entity2, selectionManager._selection[entity2._id], 'Entity2 not added to selection correctly.');
      doh.is(entity3, selectionManager._selection[entity3._id], 'Entity3 not added to selection correctly.');
      doh.is(entity4, selectionManager._selection[entity4._id], 'Entity4 not added to selection correctly.');
      doh.f(entity1.selected, 'Entity1 was not deselected');
      doh.t(entity2.selected, 'Entity2 was not actually selected');
      doh.t(entity3.selected, 'Entity3 was not actually selected');
      doh.t(entity4.selected, 'Entity4 was not actually selected');
    },
    
    testSelectEntities_ClearSelection2: function () {
      selectionManager.selectEntity(entity1._id);
      selectionManager.selectEntities([entity2._id, entity3._id, entity4._id]);
      doh.f(selectionManager._selection[entity1._id], 'Entity1 not deselected correctly.');
      doh.is(entity2, selectionManager._selection[entity2._id], 'Entity2 not added to selection correctly.');
      doh.is(entity3, selectionManager._selection[entity3._id], 'Entity3 not added to selection correctly.');
      doh.is(entity4, selectionManager._selection[entity4._id], 'Entity4 not added to selection correctly.');
      doh.f(entity1.selected, 'Entity1 was not deselected');
      doh.t(entity2.selected, 'Entity2 was not actually selected');
      doh.t(entity3.selected, 'Entity3 was not actually selected');
      doh.t(entity4.selected, 'Entity4 was not actually selected');
    }        
  }).register(doh);
});

