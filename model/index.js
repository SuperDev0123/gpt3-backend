const File = require('./File')
const Information = require('./Information')


File.hasMany(Information, { foreignKey: 'file_id', as: 'informations' });
Information.belongsTo(File, {
    foreignKey: 'file_id',
    onDelete: 'CASCADE'
});

module.exports = {
    File,
    Information,
}