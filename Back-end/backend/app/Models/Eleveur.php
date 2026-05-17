<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Eleveur extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_eleveur';

    protected $fillable = [
        'nom',
        'prenom',
        'cin',
        'adresse',
        'telephone',
        'commune',
        'compte_actif',
        'id_utilisateur',
    ];

    protected $casts = [
        'compte_actif' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function pvInscription(): HasOne
    {
        return $this->hasOne(PvInscription::class, 'id_eleveur', 'id_eleveur');
    }

    public function reclamations(): HasMany
    {
        return $this->hasMany(Reclamation::class, 'id_eleveur', 'id_eleveur');
    }

    public function pvBouclages(): HasMany
    {
        return $this->hasMany(PvBouclage::class, 'id_eleveur', 'id_eleveur');
    }
}
