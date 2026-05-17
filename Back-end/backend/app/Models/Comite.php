<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comite extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_comite';

    protected $fillable = [
        'nom_comite',
        'role',
        'region',
        'email_comite',
        'password_comite',
        'created_by',
    ];

    public function membres(): BelongsToMany
    {
        return $this->belongsToMany(Membre::class, 'comite_membre', 'id_comite', 'id_membre')
            ->withTimestamps();
    }

    public function pvInscriptions(): HasMany
    {
        return $this->hasMany(PvInscription::class, 'id_comite', 'id_comite');
    }
}
