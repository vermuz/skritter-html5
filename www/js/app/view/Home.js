/*
 * 
 * View: Home
 * 
 * Created By: Joshua McFarland
 * 
 */
define([
    'require.text!template/home-view.html',
    'view/Grid',
    'view/Toolbar',
    'backbone'
], function(templateHome, GridView, ToolbarView) {
    
    var HomeView = Backbone.View.extend({
	
	initialize: function() {
	    HomeView.grid = new GridView();
	    HomeView.toolbar = new ToolbarView();
	},
		
	template: templateHome,
		
	render: function() {
	    this.$el.html(this.template);
	    
	    HomeView.toolbar.setElement($('#toolbar-container')).render();
	    HomeView.grid.setElement($('#grid-container')).render();
	    
	    if (Skritter.user.isLoggedIn()) {
		HomeView.toolbar.addOption(Skritter.user.getAvatar(), 'avatar');
		HomeView.toolbar.addOption(Skritter.user.get('name'), 'username');
		HomeView.toolbar.addOption('Due:' + Skritter.study.items.getReadyCount(), 'items-due');
		HomeView.grid.addTile('{study}', 'study-button', ['button']);
		HomeView.grid.addTile('{options}', 'options-button', ['button']);
		HomeView.grid.addTile('{lists}', 'list-button', ['button']);
		HomeView.grid.addTile('{vocab}', 'vocab-button', ['button']);
		HomeView.grid.addTile('Last Sync: ' + new Date(Skritter.user.get('lastSync')*1000), 'sync-button', ['button']);
		HomeView.grid.addTile('{logout}', 'logout-button', ['button']);
	    } else {
		HomeView.toolbar.addOption('{logo}', 'logo');
		HomeView.grid.addTile('{login}', 'login-button', ['button']);
	    }
	    
	    HomeView.toolbar.addOption(Skritter.settings.get('version'), 'version');
	    HomeView.grid.update();
	    
	    return this;
	},
		
	events: {
	    'click.HomeView #list-button': 'toList',
	    'click.HomeView #login-button': 'toLogin',
	    'click.HomeView #logout-button': 'toLogout',
	    'click.HomeView #options-button': 'toOptions',
	    'click.HomeView #sync-button': 'sync',
	    'click.HomeView #study-button': 'toStudy',
	    'click.HomeView #vocab-button': 'toVocab'
	},
		
	sync: function() {
	    var self = this;
	    Skritter.facade.show('SYNCING');
	    Skritter.manager.sync(function() {
		self.render();
		Skritter.facade.hide();
	    });
	},
		
	toList: function() {
	    document.location.hash = 'list';
	},
	
	toLogin: function() {
	    document.location.hash = 'login';
	},
	
	toLogout: function() {
	    document.location.hash = 'logout';
	},
		
	toOptions: function() {
	    document.location.hash = 'options';
	},
		
	toStudy: function() {
	    document.location.hash = 'study';
	},
		
	toVocab: function() {
	    document.location.hash ='vocab';
	}
	
    });
    
    
    return HomeView;
});