var moduleHandler = function() {
	
	var modules = new Array();
	
	this.registerModule = function(name, module) {
		module.name = name;
		modules.push(module);
	};
	
	this.getModule = function(module) {
		for ( var int = 0; int < modules.length; int++) {
			var mod = modules[int];
			if(mod.name === module) {
				return mod;
			}
		}
		return null;
	};
};

